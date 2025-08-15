import { produce } from 'immer';
import { mutate } from 'swr';

import { invalidateCachePattern } from '@hooks/cache-keys';

import { ChatsService } from '@services/chats/chats-service';

import type { Chat } from '@shared-types/entities';

export const useRenameChat = () => {
  const renameChat = async (id: string, name: string) => {
    try {
      // Optimistically update all chat caches that might contain this chat
      await mutate(
        invalidateCachePattern(['chats']),
        produce((draft?: Chat[]) => {
          if (!draft) {
            return draft;
          }

          const chatIndex = draft.findIndex(chat => chat.id === id);
          if (chatIndex !== -1) {
            draft[chatIndex].name = name;
          }

          return draft;
        }),
        {
          revalidate: false,
          rollbackOnError: true,
        }
      );

      // Make API call to update on server
      await ChatsService.updateChatDetails(id, { name });
    } catch (error) {
      console.error('Failed to rename chat:', error);
      throw error;
    }
  };

  return {
    renameChat,
  };
};
