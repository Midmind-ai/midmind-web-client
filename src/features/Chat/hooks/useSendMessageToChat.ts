import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@shared/services/chats/chatsService';

import { emitResponseChunk } from '@/features/Chat/utils/llmResponseEmitter';
import type {
  SendMessageToChatRequest,
  SendMessageToChatResponse,
} from '@/shared/services/chats/types';
import type { ChatMessage } from '@/shared/types/entities';

export const useSendMessageToChat = (chatId: string) => {
  const { cache, mutate } = useSWRConfig();
  const {
    trigger,
    isMutating: isLoading,
    error,
  } = useSWRMutation(
    SWRCacheKeys.SendMessageToChat,
    (_, { arg }: { arg: SendMessageToChatRequest }) =>
      ChatsService.sendMessageToChat(chatId, arg, (chunk: SendMessageToChatResponse) => {
        const cachedData = cache.get(SWRCacheKeys.GetMessages(chatId));

        let found = false;
        if (cachedData && cachedData.data && Array.isArray(cachedData.data.data)) {
          for (let i = cachedData.data.data.length - 1; i >= 0; i--) {
            const message = cachedData.data.data[i];
            if (message.id === chunk.id) {
              found = true;
              break;
            }
          }
        }

        if (found) {
          emitResponseChunk(chunk);

          return;
        }

        if (chunk.id && chunk.type === 'content') {
          const llmResponse: ChatMessage = {
            id: chunk.id,
            content: chunk.body,
            role: 'model',
            created_at: new Date().toISOString(),
          };

          mutate(
            SWRCacheKeys.GetMessages(chatId),
            (data?: { data: ChatMessage[] }) => {
              if (data && Array.isArray(data.data)) {
                return {
                  ...data,
                  data: [...data.data, llmResponse],
                };
              }

              return data;
            },
            false
          );

          emitResponseChunk(chunk);
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
      SWRCacheKeys.GetMessages(chatId),
      (data?: { data: ChatMessage[] }) => {
        if (data && Array.isArray(data.data)) {
          return {
            ...data,
            data: [...data.data, tempMessage],
          };
        }
      },
      false
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
