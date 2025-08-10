import useSWR from 'swr';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@shared/services/chats/chats-service';

export const useGetChatsByDirectory = (
  parentDirectoryId?: string,
  parentChatId?: string
) => {
  const {
    data: chats,
    isLoading,
    error,
    mutate,
  } = useSWR(SWRCacheKeys.GetChatsWithParent(parentDirectoryId, parentChatId), () =>
    ChatsService.getChats({ parentDirectoryId, parentChatId })
  );

  return {
    chats,
    isLoading,
    error,
    mutate,
  };
};
