import { useSWRConfig } from 'swr';

import { CACHE_KEYS, findCacheKeysByPattern } from '@hooks/cache-keys';

import { ChatsService } from '@services/chats/chats-service';

import type { Chat } from '@shared-types/entities';

type DeleteChatParams = {
  id: string;
  parentDirectoryId?: string;
  parentChatId?: string;
};

export const useDeleteChat = () => {
  const { mutate } = useSWRConfig();

  const deleteChat = async ({
    id,
    parentDirectoryId,
    parentChatId,
  }: DeleteChatParams) => {
    const cacheKey = CACHE_KEYS.chats.byParentId(parentDirectoryId, parentChatId);

    await mutate(
      cacheKey,
      async (current?: Chat[]): Promise<Chat[]> => {
        // API call - errors handled by Axios interceptor globally
        await ChatsService.deleteChat(id);

        // Clean up related caches after successful deletion
        await mutate(['chat', id], undefined, { revalidate: false });
        await mutate(findCacheKeysByPattern(['messages', id]), undefined, {
          revalidate: false,
        });

        // If this is a branch chat, the parent might need to update its has_branches flag
        if (parentChatId) {
          await mutate(findCacheKeysByPattern(['chats']), undefined, {
            revalidate: false,
          });
        }

        // Return updated data (without the deleted item)
        if (!current) return [];

        return current.filter(chat => chat.id !== id);
      },
      {
        optimisticData: (current?: Chat[]): Chat[] => {
          // Immediate optimistic update - remove from UI
          if (!current) return [];

          return current.filter(chat => chat.id !== id);
        },
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  return { deleteChat };
};
