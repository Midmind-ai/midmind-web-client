import { useState } from 'react';

import { produce } from 'immer';
import { mutate } from 'swr';

import { CACHE_KEYS, invalidateCachePattern } from '@hooks/cache-keys';

import { ChatsService } from '@services/chats/chats-service';

import type { Chat } from '@shared-types/entities';

type DeleteChatParams = {
  id: string;
  parentDirectoryId?: string;
  parentChatId?: string;
};

export const useDeleteChat = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteChat = async ({
    id,
    parentDirectoryId,
    parentChatId,
  }: DeleteChatParams) => {
    setIsDeleting(true);

    try {
      // Optimistically remove from the appropriate parent cache
      const cacheKey = CACHE_KEYS.chats.withParent(parentDirectoryId, parentChatId);

      await mutate(
        cacheKey,
        produce((draft?: Chat[]) => {
          if (!draft) {
            return draft;
          }

          return draft.filter(chat => chat.id !== id);
        }),
        { revalidate: false, rollbackOnError: true }
      );

      // Make the API call
      await ChatsService.deleteChat(id);

      // Invalidate related caches after successful deletion
      // Invalidate the specific chat details cache
      await mutate(['chat', id], undefined, false);

      // Invalidate message cache for this chat
      await mutate(invalidateCachePattern(['messages', id]));

      // If this is a branch chat, the parent might need to update its has_branches flag
      if (parentChatId) {
        // Invalidate all chat caches to ensure has_branches is updated
        await mutate(invalidateCachePattern(['chats']));
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteChat,
    isDeleting,
  };
};
