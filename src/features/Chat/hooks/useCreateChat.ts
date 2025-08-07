import { useSWRConfig } from 'swr';
import { v4 as uuidv4 } from 'uuid';

import { SWRCacheKeys } from '@shared/constants/api';

import type { Chat, ChatMessage } from '@shared/types/entities';

import { ITEMS_PER_PAGE } from '@/features/Chat/hooks/useGetChatMessages';
import type { LLModel } from '@/features/Chat/types/chatTypes';
import { handleLLMResponse } from '@/features/Chat/utils/swr';
import type {
  ConversationWithAIRequestDto,
  ConversationWithAIResponseDto,
} from '@/shared/services/conversations/conversations.dto';
import { ConversationsService } from '@/shared/services/conversations/conversations.service';
import { useAbortControllerStore } from '@/shared/stores/useAbortControllerStore';

type CreateChatArgs = {
  content: string;
  model: LLModel;
  sendMessage?: boolean;
};

export const useCreateChat = () => {
  const { mutate } = useSWRConfig();

  const clearAbortController = useAbortControllerStore(state => state.clearAbortController);
  const createAbortController = useAbortControllerStore(state => state.createAbortController);

  const createChat = async ({ content, model, sendMessage = false }: CreateChatArgs) => {
    const chatId = uuidv4();
    const messageId = uuidv4();

    const newChat: Chat = {
      id: chatId,
      name: 'New chat',
    };

    await mutate(
      SWRCacheKeys.GetChats,
      (existingChats?: Chat[]) => {
        if (!existingChats) {
          return [newChat];
        }

        return [newChat, ...existingChats];
      },
      { revalidate: false }
    );

    if (sendMessage) {
      const userMessage: ChatMessage = {
        id: messageId,
        content: content,
        role: 'user',
        threads: [],
        llm_model: model,
        created_at: new Date().toISOString(),
      };

      const messagesKey = `${SWRCacheKeys.GetMessages(chatId)}?page=0&skip=0&take=${ITEMS_PER_PAGE}`;

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
          handleLLMResponse(mutate, clearAbortController, chatId, model, chunk);
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
