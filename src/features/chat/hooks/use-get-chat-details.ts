import useSWR from 'swr';

import { CACHE_KEYS } from '@/hooks/cache-keys';
import { ChatsService } from '@/services/chats/chats-service';

export const useGetChatDetails = (id: string) => {
  const {
    data: chatDetails,
    isLoading: isLoading,
    error,
  } = useSWR(CACHE_KEYS.chats.details(id), () => ChatsService.getChatDetails(id));

  return {
    chatDetails,
    isLoading,
    error,
  };
};
