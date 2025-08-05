import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@shared/services/chats/chatsService';

import { getInfiniteKey, handleLLMResponse } from '@/features/Chat/utils/swr';
import type {
  ConversationWithAIRequest,
  ConversationWithAIResponse,
} from '@/shared/services/chats/types';
import { useAbortControllerStore } from '@/shared/stores/useAbortControllerStore';
import type { PaginatedResponse } from '@/shared/types/common';
import type { ChatMessage } from '@/shared/types/entities';

export const useConversationWithAI = (chatId: string) => {
  const { mutate } = useSWRConfig();
  const {
    trigger,
    isMutating: isLoading,
    error,
  } = useSWRMutation(
    SWRCacheKeys.SendMessageToChat(chatId),
    async (_, { arg }: { arg: ConversationWithAIRequest }) => {
      const abortController = createAbortController(chatId);

      ChatsService.conversationWithAI(
        arg,
        (chunk: ConversationWithAIResponse) => {
          handleLLMResponse(mutate, clearAbortController, chatId, arg.model, chunk);
        },
        abortController.signal
      );
    }
  );

  const { abortControllers, createAbortController, clearAbortController, abortCurrentRequest } =
    useAbortControllerStore();

  const conversationWithAI = async (body: ConversationWithAIRequest) => {
    const userMessage: ChatMessage = {
      id: body.message_id,
      created_at: new Date().toISOString(),
      content: body.content,
      role: 'user',
      threads: [],
      llm_model: body.model,
    };

    await mutate(
      getInfiniteKey(chatId),
      (data?: PaginatedResponse<ChatMessage[]>[]) => {
        if (!data || !Array.isArray(data) || data.length === 0) {
          return data;
        }

        const allMessages = data.flatMap(page => page.data || []);
        const messageExists = allMessages.some(message => message.id === userMessage.id);

        if (messageExists) {
          return data;
        }

        const updatedData = [...data];
        if (updatedData[0]) {
          updatedData[0] = {
            ...updatedData[0],
            data: [userMessage, ...(updatedData[0].data || [])],
          };
        }

        return updatedData;
      },
      {
        revalidate: false,
        populateCache: true,
      }
    );

    await trigger(body, {
      rollbackOnError: true,
    });
  };

  return {
    conversationWithAI,
    abortCurrentRequest: () => abortCurrentRequest(chatId),
    hasActiveRequest: abortControllers.has(chatId),
    isLoading,
    error,
  };
};
