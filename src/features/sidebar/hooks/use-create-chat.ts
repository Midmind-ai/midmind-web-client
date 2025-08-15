import { produce } from 'immer';
import { useSWRConfig } from 'swr';
import { v4 as uuidv4 } from 'uuid';

import { ITEMS_PER_PAGE } from '@features/chat/hooks/use-get-chat-messages';
import type { LLModel } from '@features/chat/types/chat-types';
import { handleLLMResponse, getInfiniteKey } from '@features/chat/utils/swr';
import { useExpandedNodesStore } from '@features/sidebar/stores/use-expanded-nodes-store';

import { CACHE_KEYS, invalidateCachePattern } from '@hooks/cache-keys';

import { ChatsService } from '@services/chats/chats-service';
import type {
  ConversationWithAIRequestDto,
  ConversationWithAIResponseDto,
} from '@services/conversations/conversations-dtos';
import { ConversationsService } from '@services/conversations/conversations-service';

import { useAbortControllerStore } from '@stores/use-abort-controller-store';

import type { Chat, ChatMessage } from '@shared-types/entities';

type CreateChatArgs = {
  content: string;
  model: LLModel;
  sendMessage?: boolean;
  parentChatId?: string;
  parentDirectoryId?: string;
};

export const useCreateChat = () => {
  const { mutate } = useSWRConfig();
  const expandNode = useExpandedNodesStore(state => state.expandNode);

  const clearAbortController = useAbortControllerStore(
    state => state.clearAbortController
  );
  const createAbortController = useAbortControllerStore(
    state => state.createAbortController
  );

  const createChat = async ({
    content,
    model,
    sendMessage = false,
    parentChatId,
    parentDirectoryId,
  }: CreateChatArgs) => {
    const chatId = uuidv4();
    const messageId = uuidv4();

    const newChat: Chat = {
      id: chatId,
      name: 'New chat',
      parent_directory_id: parentDirectoryId || null,
      has_children: false,
    };

    // If this is a branch chat, expand the parent first
    if (parentChatId) {
      try {
        // Update parent chat's has_children flag first
        await mutate(
          invalidateCachePattern(['chats']),
          produce((draft?: Chat[]) => {
            if (!draft) {
              return draft;
            }

            const parentIndex = draft.findIndex(chat => chat.id === parentChatId);
            if (parentIndex !== -1) {
              draft[parentIndex].has_children = true;
            }

            return draft;
          }),
          { revalidate: false, rollbackOnError: true }
        );

        // Expand the parent node immediately
        expandNode(parentChatId);

        // Determine the cache key for child chats
        const cacheKey = CACHE_KEYS.chats.withParent(parentDirectoryId, parentChatId);

        // Load existing chats from server to ensure they appear in expanded area
        const existingChats = await ChatsService.getChats({ parentChatId });

        // Populate cache with existing chats, then add new chat
        await mutate(
          cacheKey,
          produce(() => {
            // Start with existing chats from server, then add new chat at the beginning
            return [newChat, ...existingChats];
          }),
          { revalidate: false, rollbackOnError: true }
        );
      } catch (error) {
        console.error('Failed to create branch chat:', error);
        throw error;
      }
    } else {
      // For non-branch chats, determine cache key and add directly
      const cacheKey = CACHE_KEYS.chats.withParent(parentDirectoryId, parentChatId);

      try {
        await mutate(
          cacheKey,
          produce((draft?: Chat[]) => {
            if (!draft) {
              return [newChat];
            }

            draft.unshift(newChat);
          }),
          { revalidate: false, rollbackOnError: true }
        );
      } catch (error) {
        console.error('Failed to create chat:', error);
        throw error;
      }
    }

    if (sendMessage) {
      const userMessage: ChatMessage = {
        id: messageId,
        content: content,
        role: 'user',
        branches: [],
        llm_model: model,
        created_at: new Date().toISOString(),
        reply_content: null,
      };

      // Populate both the infinite key cache and direct string key cache
      const infiniteKey = getInfiniteKey(chatId);
      const messagesKey = `${CACHE_KEYS.messages.chat(chatId)}?page=0&skip=0&take=${ITEMS_PER_PAGE}`;

      // Populate infinite key cache (used by handleContentChunk)
      await mutate(
        infiniteKey,
        [
          {
            data: [userMessage],
            meta: {
              total: 1,
              lastPage: 1,
              currentPage: 1,
              perPage: 20,
              prev: null,
              next: null,
            },
          },
        ],
        {
          revalidate: false,
          populateCache: true,
        }
      );

      // Also populate direct string key cache for compatibility
      await mutate(
        messagesKey,
        {
          data: [userMessage],
          meta: {
            total: 1,
            lastPage: 1,
            currentPage: 1,
            perPage: 20,
            prev: null,
            next: null,
          },
        },
        {
          revalidate: false,
          populateCache: true,
        }
      );

      const conversationBody: ConversationWithAIRequestDto = {
        chat_id: chatId,
        message_id: messageId,
        content,
        model,
      };

      const newAbortController = createAbortController(chatId);

      ConversationsService.conversationWithAI(
        conversationBody,
        (chunk: ConversationWithAIResponseDto) => {
          handleLLMResponse(
            clearAbortController,
            chatId,
            model,
            chunk,
            messageId, // parentMessageId - the user message that triggered this
            parentChatId // parentChatId - if this is a branch chat
          );
        },
        newAbortController.signal
      );
    }

    return chatId;
  };

  return {
    createChat,
  };
};
