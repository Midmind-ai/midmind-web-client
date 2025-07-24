import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@shared/services/chats/chatsService';

import type { SendMessageToChatRequest } from '@/shared/services/chats/types';

export const useSendMessageToChat = (chatId: string) => {
  const {
    trigger,
    isMutating: isLoading,
    error,
  } = useSWRMutation(
    SWRCacheKeys.SendMessageToChat,
    (_, { arg }: { arg: SendMessageToChatRequest }) => ChatsService.sendMessageToChat(chatId, arg)
  );

  const sendMessage = async (body: SendMessageToChatRequest) => {
    await trigger(body);
  };

  return {
    sendMessage,
    isLoading,
    error,
  };
};
