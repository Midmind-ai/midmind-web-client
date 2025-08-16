import { produce } from 'immer';
import { useSWRConfig } from 'swr';

import { CACHE_KEYS } from '@hooks/cache-keys';
import { useCacheUtils } from '@hooks/use-cache-utils';

import { ChatsService } from '@services/chats/chats-service';

import type { Chat } from '@shared-types/entities';

type MoveChatParams = {
  chatId: string;
  sourceParentDirectoryId?: string;
  sourceParentChatId?: string;
  targetParentDirectoryId?: string | null;
};

export const useMoveChat = () => {
  const { mutate } = useSWRConfig();
  const { cacheExists } = useCacheUtils();

  const moveChat = async ({
    chatId,
    sourceParentDirectoryId,
    sourceParentChatId,
    targetParentDirectoryId,
  }: MoveChatParams) => {
    // Get cache keys for source and target
    const sourceCacheKey = CACHE_KEYS.chats.withParent(
      sourceParentDirectoryId,
      sourceParentChatId
    );
    const targetCacheKey = CACHE_KEYS.chats.withParent(
      targetParentDirectoryId ?? undefined
    );

    // Console log will be added after we find the chat to move

    // Find the chat to move first
    let movedChat: Chat | null = null;

    try {
      // Step 1: Remove from source cache optimistically
      await mutate(
        sourceCacheKey,
        produce((draft?: Chat[]) => {
          if (!draft) {
            return draft;
          }

          const chatIndex = draft.findIndex(chat => chat.id === chatId);
          if (chatIndex !== -1) {
            movedChat = { ...draft[chatIndex] };

            return draft.filter(chat => chat.id !== chatId);
          }

          return draft;
        }),
        {
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        }
      );

      // Step 2: Add to target cache optimistically (only if cache exists)
      if (movedChat && cacheExists(targetCacheKey)) {
        await mutate(
          targetCacheKey,
          produce((draft?: Chat[]) => {
            if (!draft || !movedChat) {
              return draft;
            }

            const updatedChat = {
              ...movedChat,
              parent_directory_id: targetParentDirectoryId,
            };

            return [updatedChat, ...draft];
          }),
          {
            rollbackOnError: true,
            populateCache: true,
            revalidate: false,
          }
        );
      }

      // Step 3: Make API call
      await ChatsService.moveChat(chatId, { parentDirectoryId: targetParentDirectoryId });

      // Step 4: Revalidate both caches to ensure consistency
      mutate(sourceCacheKey);
      mutate(targetCacheKey);
    } catch (error) {
      console.error('Failed to move chat:', error);
      // Rollback will happen automatically due to rollbackOnError: true
      throw error;
    }
  };

  return {
    moveChat,
  };
};
