import { findCacheKeysByPattern } from '@hooks/cache-keys';

import { ChatsService } from '@services/chats/chats-service';

import type { Chat } from '@shared-types/entities';

import { useSWRConfig } from '@lib/swr';

export const useRenameChat = () => {
  const { mutate } = useSWRConfig();

  const renameChat = async (id: string, name: string) => {
    // Update all chat caches that might contain this chat
    await mutate(
      findCacheKeysByPattern(['chats']),
      async (current?: Chat[]): Promise<Chat[]> => {
        // API call - errors handled by Axios interceptor globally
        await ChatsService.updateChatDetails(id, { name });

        // Return updated data
        if (!current) return [];

        return current.map(chat => (chat.id === id ? { ...chat, name } : chat));
      },
      {
        optimisticData: (current?: Chat[]): Chat[] => {
          // Immediate optimistic update - update name in UI
          if (!current) return [];

          return current.map(chat => (chat.id === id ? { ...chat, name } : chat));
        },
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  return { renameChat };
};
