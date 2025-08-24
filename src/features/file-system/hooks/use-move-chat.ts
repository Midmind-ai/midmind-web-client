import { useSWRConfig, unstable_serialize } from 'swr';

import { CACHE_KEYS } from '@hooks/cache-keys';

import { ChatsService } from '@services/chats/chats-service';

import type { Chat } from '@shared-types/entities';

type MoveChatParams = {
  chatId: string;
  sourceParentDirectoryId?: string;
  sourceParentChatId?: string;
  targetParentDirectoryId?: string | null;
};

export const useMoveChat = () => {
  const { mutate, cache } = useSWRConfig();

  const moveChat = async ({
    chatId,
    sourceParentDirectoryId,
    sourceParentChatId,
    targetParentDirectoryId,
  }: MoveChatParams) => {
    const sourceCacheKey = CACHE_KEYS.chats.byParentId(
      sourceParentDirectoryId,
      sourceParentChatId
    );
    const targetCacheKey = CACHE_KEYS.chats.byParentId(targetParentDirectoryId);

    // Get current cache data for both source and target using unstable_serialize
    const sourceCacheState = cache.get(unstable_serialize(sourceCacheKey));
    const targetCacheState = cache.get(unstable_serialize(targetCacheKey));

    const sourceCacheData = sourceCacheState?.data;
    const targetCacheData = targetCacheState?.data;

    const movedChat = sourceCacheData?.find((chat: Chat) => chat.id === chatId);

    if (!movedChat) {
      throw new Error('Chat not found in cache');
    }

    // Create updated chat object
    const updatedChat = {
      ...movedChat,
      parent_directory_id: targetParentDirectoryId,
    };

    // Manual optimistic updates - immediate cache updates
    const updatedSourceCache =
      sourceCacheData?.filter((chat: Chat) => chat.id !== chatId) || [];
    const updatedTargetCache = targetCacheData
      ? [updatedChat, ...targetCacheData]
      : [updatedChat];

    // Apply optimistic updates immediately
    await mutate(sourceCacheKey, updatedSourceCache, { revalidate: false });
    await mutate(targetCacheKey, updatedTargetCache, { revalidate: false });

    try {
      // Make API call
      await ChatsService.updateChatDetails(chatId, {
        name: movedChat.name,
        directory_id: targetParentDirectoryId,
      });
    } catch (error) {
      // Manual rollback on error - restore original cache state
      await mutate(sourceCacheKey, sourceCacheData, { revalidate: false });
      await mutate(targetCacheKey, targetCacheData, { revalidate: false });

      // Re-throw error so it gets handled by global error handler
      throw error;
    }
  };

  return { moveChat };
};
