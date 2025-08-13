import useSWR from 'swr';

import { SWRCacheKeys } from '@/constants/api';
import { ChatsService } from '@/services/chats/chats-service';

export const useGetChats = () => {
  const {
    data: chats,
    isLoading,
    error,
  } = useSWR(SWRCacheKeys.GetChats, () => ChatsService.getChats());

  return {
    isLoading,
    chats,
    error,
  };
};
