import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@shared/services/chats/chatsService';

import { getInfiniteKey, handleLLMResponse } from '@/features/Chat/utils/swr';
import type {
  ConversationWithAIRequest,
  ConversationWithAIResponse,
} from '@/shared/services/chats/types';
import type { PaginatedResponse } from '@/shared/types/common';
import type { ChatMessage } from '@/shared/types/entities';

import { useThreadContext } from './useThreadContext';

export const useConversationWithAI = (chatId: string) => {
  const { mutate } = useSWRConfig();
  const { threadContext, clearThreadContext } = useThreadContext(chatId);

  const {
    trigger,
    isMutating: isLoading,
    error,
  } = useSWRMutation(
    SWRCacheKeys.SendMessageToChat(chatId),
    (_, { arg }: { arg: ConversationWithAIRequest }) => {
      ChatsService.conversationWithAI(arg, (chunk: ConversationWithAIResponse) => {
        handleLLMResponse(mutate, chatId, chunk);
      });
    }
  );

  const conversationWithAI = async (body: ConversationWithAIRequest) => {
    const userMessage: ChatMessage = {
      id: body.message_id,
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
            data: [...(updatedData[0].data || []), userMessage],
          };
        }

        return updatedData;
      },
      {
        revalidate: false,
        populateCache: true,
      }
    );

    const requestBody: ConversationWithAIRequest = {
      ...body,
      ...(threadContext && { thread_context: threadContext }),
    };

    await trigger(requestBody, {
      rollbackOnError: true,
    });

    // Only the first message of the thread will be sent with thread_context
    clearThreadContext();
  };

  return {
    conversationWithAI,
    isLoading,
    error,
  };
};
