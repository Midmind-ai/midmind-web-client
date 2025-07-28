import useSWR from 'swr';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@/shared/services/chats/chatsService';
import type { GetChatMessagesParams } from '@/shared/services/chats/types';

export const useGetChatMessages = (chatId: string, params: GetChatMessagesParams) => {
  const {
    data: messagesResponse,
    isLoading,
    error,
  } = useSWR(SWRCacheKeys.GetMessages(chatId), () => ChatsService.getChatMessages(chatId, params), {
    revalidateOnFocus: false,
  });

  const messages = messagesResponse?.data ? [...messagesResponse.data].reverse() : [];

  return {
    isLoading,
    messages,
    error,
  };
};
