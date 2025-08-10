import useSWR from 'swr';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@shared/services/chats/chats-service';

export const useGetChatsByDirectory = (parentDirectoryId?: string) => {
  const {
    data: chats,
    isLoading,
    error,
    mutate,
  } = useSWR(SWRCacheKeys.GetChatsWithParent(parentDirectoryId), () =>
    ChatsService.getChats(parentDirectoryId)
  );

  return {
    chats,
    isLoading,
    error,
    mutate,
  };
};
