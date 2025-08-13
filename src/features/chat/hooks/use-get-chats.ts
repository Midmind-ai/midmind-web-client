import useSWR from 'swr';

import { CACHE_KEYS } from '@hooks/cache-keys';

import { ChatsService } from '@services/chats/chats-service';

export const useGetChats = () => {
  const {
    data: chats,
    isLoading,
    error,
  } = useSWR(CACHE_KEYS.chats.all, () => ChatsService.getChats());

  return {
    isLoading,
    chats,
    error,
  };
};
