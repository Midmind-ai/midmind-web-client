import { produce } from 'immer';
import { useSWRConfig } from 'swr';
import { v4 as uuidv4 } from 'uuid';

import { SWRCacheKeys } from '@shared/constants/api';

import type {
  ConversationWithAIRequestDto,
  ConversationWithAIResponseDto,
} from '@shared/services/conversations/conversations-dtos';
import { ConversationsService } from '@shared/services/conversations/conversations-service';

import { useAbortControllerStore } from '@shared/stores/use-abort-controller-store';

import type { Chat, ChatMessage } from '@shared/types/entities';

import { CacheSelectors } from '@shared/utils/cache-selectors';

import { ITEMS_PER_PAGE } from '@features/chat/hooks/use-get-chat-messages';
import type { LLModel } from '@features/chat/types/chat-types';
import { handleLLMResponse } from '@features/chat/utils/swr';
import { useExpandedNodesStore } from '@features/sidebar/stores/use-expanded-nodes-store';

type CreateChatArgs = {
  content: string;
  model: LLModel;
  sendMessage?: boolean;
  parentChatId?: string;
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
  }: CreateChatArgs) => {
    const chatId = uuidv4();
    const messageId = uuidv4();

    const newChat: Chat = {
      id: chatId,
      name: 'New chat',
      parent_directory_id: parentChatId || null,
      has_children: false,
    };

    // Determine the correct cache key based on whether this is a branch chat or root chat
    const cacheKey = parentChatId
      ? SWRCacheKeys.GetChatsWithParent(undefined, parentChatId)
      : SWRCacheKeys.GetChats;

    // Optimistically update the specific cache
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

    // If this is a branch chat, we need to update the parent chat's has_children property
    if (parentChatId) {
      // Update parent chat's has_children property in all chat lists
      mutate(
        CacheSelectors.allChats,
        produce((draft?: Chat[]) => {
          if (!draft) {
            return draft;
          }

          const parentChatIndex = draft.findIndex(chat => chat.id === parentChatId);
          if (parentChatIndex !== -1) {
            draft[parentChatIndex].has_children = true;
          }

          return draft;
        }),
        { revalidate: false }
      );

      // Auto-expand the parent node after all cache updates are complete
      // Use setTimeout to ensure the component re-renders with updated has_children state
      setTimeout(() => {
        expandNode(parentChatId);
      }, 100);
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

      // Build the messages cache key with pagination
      const messagesKey = [
        ...SWRCacheKeys.GetMessagesPaginated(chatId, 0),
        `?skip=0&take=${ITEMS_PER_PAGE}`,
      ];

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
          handleLLMResponse(clearAbortController, chatId, model, chunk);
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
