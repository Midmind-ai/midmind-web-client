import { CACHE_KEYS } from '@hooks/cache-keys';

import { ChatsService } from '@services/chats/chats-service';

import type { Chat } from '@shared-types/entities';

import { useSWR } from '@lib/swr';

// Hook for getting chats by parent directory
export const useChatsByParentDirectory = (parentDirectoryId?: string | null) => {
  const {
    data: chats,
    isLoading,
    error,
    mutate,
  } = useSWR<Chat[]>(
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
export const useChatsByParentChat = (parentChatId?: string | null) => {
  const {
    data: chats,
    isLoading,
    error,
    mutate,
  } = useSWR<Chat[]>(
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
