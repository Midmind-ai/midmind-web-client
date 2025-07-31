import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import { v4 as uuidv4 } from 'uuid';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@shared/services/chats/chatsService';

import { getInfiniteKey, handleLLMResponse } from '@/features/Chat/utils/swr';
import type {
  ConversationWithAIRequest,
  ConversationWithAIResponse,
} from '@/shared/services/chats/types';
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
    (_, { arg }: { arg: ConversationWithAIRequest }) => {
      ChatsService.conversationWithAI(arg, (chunk: ConversationWithAIResponse) => {
        handleLLMResponse(mutate, chatId, chunk);
      });
    }
  );

  const conversationWithAI = async (body: ConversationWithAIRequest) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: body.content,
      role: 'user',
      threads: [],
      llm_model: null,
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

    await trigger(body, {
      rollbackOnError: true,
    });
  };

  return {
    conversationWithAI,
    isLoading,
    error,
  };
};
