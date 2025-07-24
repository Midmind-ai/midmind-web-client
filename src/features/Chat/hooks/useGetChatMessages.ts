import useSWR from 'swr';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@/shared/services/chats/chatsService';

export const useGetChatMessages = (chatId: string) => {
  const {
    data: messages,
    isLoading,
    error,
  } = useSWR(SWRCacheKeys.GetMessages(chatId), () => ChatsService.getChatMessages(chatId), {
    revalidateOnFocus: false,
  });

  return {
    isLoading,
    messages,
    error,
  };
};
