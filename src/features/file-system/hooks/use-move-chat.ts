import { produce } from 'immer';
import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { swrMutationConfig } from '@config/swr';

import { CACHE_KEYS, MUTATION_KEYS } from '@hooks/cache-keys';

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

  const moveChatSWR = useSWRMutation(
    MUTATION_KEYS.chats.move,
    async (_, { arg }: { arg: MoveChatParams }) => {
      const {
        chatId,
        sourceParentDirectoryId,
        sourceParentChatId,
        targetParentDirectoryId,
      } = arg;

      const sourceCacheKey = CACHE_KEYS.chats.withParent(
        sourceParentDirectoryId,
        sourceParentChatId
      );
      const targetCacheKey = CACHE_KEYS.chats.withParent(targetParentDirectoryId);

      let movedChat: Chat | undefined;
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
          populateCache: true,
          revalidate: false,
        }
      );

      if (movedChat) {
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
            populateCache: true,
            revalidate: false,
          }
        );
      }

      if (!movedChat) {
        throw new Error('Chat not found in cache');
      }

      const chatToUpdate: Chat = movedChat;
      await ChatsService.updateChatDetails(chatId, {
        name: chatToUpdate.name,
        directory_id: targetParentDirectoryId,
      });
      mutate(sourceCacheKey);
      mutate(targetCacheKey);

      return {
        chatId,
        sourceParentDirectoryId,
        sourceParentChatId,
        targetParentDirectoryId,
      };
    },
    swrMutationConfig
  );

  return {
    moveChat: moveChatSWR.trigger,
    isMutating: moveChatSWR.isMutating,
    error: moveChatSWR.error,
  };
};
