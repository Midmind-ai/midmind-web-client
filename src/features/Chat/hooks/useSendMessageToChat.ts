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
        emitResponseChunk(chunk);

        if (chunk.id && chunk.type === 'content') {
          const cachedData = cache.get(SWRCacheKeys.GetMessages(chatId));
          const messages = cachedData?.data?.data;

          const messageExists =
            Array.isArray(messages) && messages.some(message => message.id === chunk.id);

          if (!messageExists) {
            const llmResponse: ChatMessage = {
              id: chunk.id,
              content: chunk.body,
              role: 'model',
              created_at: new Date().toISOString(),
            };

            mutate(
              SWRCacheKeys.GetMessages(chatId),
              (data?: { data: ChatMessage[] }) => {
                if (!data?.data) {
                  return data;
                }

                return {
                  ...data,
                  data: [...data.data, llmResponse],
                };
              },
              false
            );
          }
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
        if (!data?.data) {
          return data;
        }

        return {
          ...data,
          data: [...data.data, tempMessage],
        };
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
