import useSWR from 'swr';

import { CACHE_KEYS } from '@hooks/cache-keys';

import { ChatsService } from '@services/chats/chats-service';

// Hook for getting chats by parent directory
export const useSwrGetChatsByParentDirectory = (parentDirectoryId?: string | null) => {
  const {
    data: chats,
    isLoading,
    error,
    mutate,
  } = useSWR(
    parentDirectoryId !== null
      ? CACHE_KEYS.chats.byParentId(parentDirectoryId, undefined)
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
export const useSwrGetChatsByParentChat = (parentChatId?: string | null) => {
  const {
    data: chats,
    isLoading,
    error,
    mutate,
  } = useSWR(
    parentChatId !== null ? CACHE_KEYS.chats.byParentId(undefined, parentChatId) : null,
    parentChatId !== null ? () => ChatsService.getChats({ parentChatId }) : null
  );

  return {
    chats,
    isLoading,
    error,
    mutate,
  };
};
