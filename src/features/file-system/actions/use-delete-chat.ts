import { CACHE_KEYS, findCacheKeysByPattern } from '@hooks/cache-keys';

import { ChatsService } from '@services/chats/chats-service';

import type { Chat } from '@shared-types/entities';

import { useSWRConfig, unstable_serialize } from '@lib/swr';

type DeleteChatParams = {
  id: string;
  parentDirectoryId?: string;
  parentChatId?: string;
};

export const useDeleteChat = () => {
  const { mutate, cache } = useSWRConfig();

  const deleteChat = async ({
    id,
    parentDirectoryId,
    parentChatId,
  }: DeleteChatParams) => {
    // Determine the cache key for the chat's parent container
    const cacheKey = CACHE_KEYS.chats.byParentId(parentDirectoryId, parentChatId);

    // STEP 1: Get current cache states for all affected caches
    const mainCacheState = cache.get(unstable_serialize(cacheKey));
    const mainCacheData = mainCacheState?.data;

    // For nested chats, we need to update the parent chat's has_children flag
    // The parent chat is located in the same directory as the chat we're deleting
    let parentCacheKey: ReturnType<typeof CACHE_KEYS.chats.byParentId> | null = null;
    let parentCacheData: Chat[] | undefined = undefined;

    if (parentChatId) {
      // Parent chat is in the same directory as the chat we're deleting
      parentCacheKey = CACHE_KEYS.chats.byParentId(parentDirectoryId, undefined);
      const parentCacheState = cache.get(unstable_serialize(parentCacheKey));
      parentCacheData = parentCacheState?.data;
    }

    // STEP 2: Calculate optimistic updates
    const updatedMainCache = mainCacheData?.filter((chat: Chat) => chat.id !== id) || [];

    // Check if this was the last child of the parent chat
    const isLastChild = parentChatId && updatedMainCache.length === 0;

    // STEP 3: Apply immediate optimistic updates to all affected caches

    // Remove chat from its parent cache
    await mutate(cacheKey, updatedMainCache, { revalidate: false });

    // If this was the last child of a parent chat, update parent's has_children flag
    if (isLastChild && parentChatId && parentCacheKey && parentCacheData) {
      const updatedParentCache = parentCacheData.map((chat: Chat) =>
        chat.id === parentChatId ? { ...chat, has_children: false } : chat
      );
      await mutate(parentCacheKey, updatedParentCache, { revalidate: false });
    }

    // STEP 4: Make API call with manual rollback on error
    try {
      // Delete chat from server
      await ChatsService.deleteChat(id);

      // Clean up related caches after successful deletion
      await mutate(['chat', id], undefined, { revalidate: false });
      await mutate(findCacheKeysByPattern(['messages', id]), undefined, {
        revalidate: false,
      });
    } catch (error) {
      // STEP 5: Manual rollback on error - restore all original cache states

      // Restore main chat cache
      await mutate(cacheKey, mainCacheData, { revalidate: false });

      // Restore parent cache if this was a nested chat
      if (parentChatId && parentCacheKey && parentCacheData) {
        await mutate(parentCacheKey, parentCacheData, { revalidate: false });
      }

      // Re-throw error so it gets handled by global error handler
      throw error;
    }
  };

  return { deleteChat };
};
