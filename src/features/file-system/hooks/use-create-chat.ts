import { produce } from 'immer';
import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import { v4 as uuidv4 } from 'uuid';

import { swrMutationConfig } from '@config/swr';

import { ITEMS_PER_PAGE } from '@features/chat/hooks/use-get-chat-messages';
import type { LLModel } from '@features/chat/types/chat-types';
import { handleLLMResponse, getInfiniteKey } from '@features/chat/utils/swr';
import { useExpandedNodesStore } from '@features/file-system/stores/use-expanded-nodes-store';

import { CACHE_KEYS, MUTATION_KEYS, findCacheKeysByPattern } from '@hooks/cache-keys';

import type { CreateNewChatRequestDto } from '@services/chats/chats-dtos';
import { ChatsService } from '@services/chats/chats-service';
import type {
  ConversationWithAIRequestDto,
  ConversationWithAIResponseDto,
} from '@services/conversations/conversations-dtos';
import { ConversationsService } from '@services/conversations/conversations-service';

import { useAbortControllerStore } from '@stores/use-abort-controller-store';

import type { ChatBranchContext, Chat, ChatMessage } from '@shared-types/entities';

type CreateChatArgs = {
  content: string;
  model: LLModel;
  sendMessage?: boolean;
  parentChatId?: string;
  parentDirectoryId?: string;
  branchContext?: ChatBranchContext;
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

  const createChatSWR = useSWRMutation(
    MUTATION_KEYS.chats.create,
    async (_, { arg }: { arg: CreateChatArgs }) => {
      const {
        content,
        model,
        sendMessage = false,
        parentChatId,
        parentDirectoryId,
        branchContext,
      } = arg;

      const chatId = uuidv4();
      const messageId = uuidv4();

      const newChatDto: CreateNewChatRequestDto = {
        id: chatId,
        name: 'New chat',
        directory_id: parentDirectoryId,
        ...(branchContext &&
          parentChatId && {
            branch_context: {
              parent_chat_id: parentChatId,
              parent_message_id: branchContext.parent_message_id,
              selected_text: branchContext.selected_text,
              start_position: branchContext.start_position,
              end_position: branchContext.end_position,
              connection_type: branchContext.connection_type,
              context_type: branchContext.context_type,
            },
          }),
      };

      await ChatsService.createNewChat(newChatDto);

      const newChat: Chat = {
        id: chatId,
        name: 'New chat',
        parent_directory_id: parentDirectoryId || null,
        has_children: false,
      };

      // If this is a branch chat, expand the parent first
      if (parentChatId) {
        // Update parent chat's has_children flag first
        await mutate(
          findCacheKeysByPattern(['chats']),
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
          { revalidate: false }
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
          { revalidate: false }
        );
      } else {
        // For non-branch chats, determine cache key and add directly
        const cacheKey = CACHE_KEYS.chats.withParent(parentDirectoryId, parentChatId);

        await mutate(
          cacheKey,
          produce((draft?: Chat[]) => {
            if (!draft) {
              return [newChat];
            }

            draft.unshift(newChat);
          }),
          { revalidate: false }
        );
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
          ...(branchContext && {
            branch_context: {
              parent_message_id: branchContext.parent_message_id,
            },
          }),
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
    },
    swrMutationConfig
  );

  const createChat = async ({
    content,
    model,
    sendMessage = false,
    parentChatId,
    parentDirectoryId,
    branchContext,
  }: CreateChatArgs) => {
    return createChatSWR.trigger({
      content,
      model,
      sendMessage,
      parentChatId,
      parentDirectoryId,
      branchContext,
    });
  };

  return {
    createChat,
    isMutating: createChatSWR.isMutating,
    error: createChatSWR.error,
  };
};
