import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@shared/services/chats/chatsService';

import { getInfiniteKey } from '@/features/Chat/utils/getInfiniteKey';
import { emitResponseChunk } from '@/features/Chat/utils/llmResponseEmitter';
import type {
  SendMessageToChatRequest,
  SendMessageToChatResponse,
} from '@/shared/services/chats/types';
import type { PaginatedResponse } from '@/shared/types/common';
import type { ChatMessage } from '@/shared/types/entities';

export const useSendMessageToChat = (chatId: string) => {
  const { mutate } = useSWRConfig();
  const {
    trigger,
    isMutating: isLoading,
    error,
  } = useSWRMutation(
    SWRCacheKeys.SendMessageToChat,
    (_, { arg }: { arg: SendMessageToChatRequest }) =>
      ChatsService.sendMessageToChat(chatId, arg, (chunk: SendMessageToChatResponse) => {
        emitResponseChunk(chunk);

        if (chunk.id && chunk.type === 'content') {
          const llmResponse: ChatMessage = {
            id: chunk.id,
            content: chunk.body,
            role: 'model',
            created_at: new Date().toISOString(),
          };

          mutate(
            getInfiniteKey(chatId),
            (data?: PaginatedResponse<ChatMessage[]>[]) => {
              if (!data || !Array.isArray(data) || data.length === 0) {
                return data;
              }

              const allMessages = data.flatMap(page => page.data || []);
              const messageExists = allMessages.some(message => message.id === chunk.id);

              if (messageExists) {
                return data;
              }

              const updatedData = [...data];
              if (updatedData[0]) {
                updatedData[0] = {
                  ...updatedData[0],
                  data: [llmResponse, ...(updatedData[0].data || [])],
                };
              }

              return updatedData;
            },
            {
              revalidate: false,
              populateCache: true,
            }
          );
        }
      })
  );

  const sendMessage = async (body: SendMessageToChatRequest) => {
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}-user`,
      content: body.content,
      role: 'user',
      created_at: new Date().toISOString(),
    };

    await mutate(
      getInfiniteKey(chatId),
      (data?: PaginatedResponse<ChatMessage[]>[]) => {
        if (!data || !Array.isArray(data) || data.length === 0) {
          return data;
        }

        const allMessages = data.flatMap(page => page.data || []);
        const messageExists = allMessages.some(message => message.id === tempMessage.id);

        if (messageExists) {
          return data;
        }

        const updatedData = [...data];
        if (updatedData[0]) {
          updatedData[0] = {
            ...updatedData[0],
            data: [tempMessage, ...(updatedData[0].data || [])],
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
    sendMessage,
    isLoading,
    error,
  };
};
