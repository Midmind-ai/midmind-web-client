import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import { getInfiniteKey, handleLLMResponse } from '@/features/Chat/utils/swr';
import type {
  ConversationWithAIRequestDto,
  ConversationWithAIResponseDto,
} from '@/shared/services/conversations/conversations.dto';
import { ConversationsService } from '@/shared/services/conversations/conversations.service';
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
    async (_, { arg }: { arg: ConversationWithAIRequestDto }) => {
      const abortController = createAbortController(chatId);

      ConversationsService.conversationWithAI(
        arg,
        (chunk: ConversationWithAIResponseDto) => {
          handleLLMResponse(
            mutate,
            clearAbortController,
            chatId,
            arg.model,
            chunk,
            arg.thread_context?.parent_message_id,
            arg.thread_context?.parent_chat_id
          );
        },
        abortController.signal
      );
    }
  );

  const { abortControllers, createAbortController, clearAbortController, abortCurrentRequest } =
    useAbortControllerStore();

  const conversationWithAI = async (body: ConversationWithAIRequestDto) => {
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
