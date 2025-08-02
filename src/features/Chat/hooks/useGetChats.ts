import useSWR from 'swr';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@/shared/services/chats/chatsService';

export const useGetChats = () => {
  const { data: chats, isLoading, error } = useSWR(SWRCacheKeys.GetChats, ChatsService.getChats);

  return {
    isLoading,
    chats,
    error,
  };
};
