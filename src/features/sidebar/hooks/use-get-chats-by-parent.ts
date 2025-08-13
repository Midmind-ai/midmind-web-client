import useSWR from 'swr';

import { SWRCacheKeys } from '@/constants/api';
import { ChatsService } from '@/services/chats/chats-service';

// Hook for getting chats by parent directory
export const useGetChatsByParentDirectory = (parentDirectoryId?: string | null) => {
  const {
    data: chats,
    isLoading,
    error,
    mutate,
  } = useSWR(
    parentDirectoryId !== null
      ? SWRCacheKeys.GetChatsWithParent(parentDirectoryId, undefined)
      : null,
    parentDirectoryId !== null ? () => ChatsService.getChats({ parentDirectoryId }) : null
  );

  return {
    chats,
    isLoading,
    error,
    mutate,
  };
};

// Hook for getting chats by parent chat (sub-chats)
export const useGetChatsByParentChat = (parentChatId?: string | null) => {
  const {
    data: chats,
    isLoading,
    error,
    mutate,
  } = useSWR(
    parentChatId !== null
      ? SWRCacheKeys.GetChatsWithParent(undefined, parentChatId)
      : null,
    parentChatId !== null ? () => ChatsService.getChats({ parentChatId }) : null
  );

  return {
    chats,
    isLoading,
    error,
    mutate,
  };
};
