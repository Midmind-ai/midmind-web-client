import { produce } from 'immer';
import { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';

import { swrMutationConfig } from '@config/swr';

import { MUTATION_KEYS, findCacheKeysByPattern } from '@hooks/cache-keys';

import { ChatsService } from '@services/chats/chats-service';

import type { Chat } from '@shared-types/entities';

type RenameChatParams = {
  id: string;
  name: string;
};

export const useRenameChat = () => {
  const renameChatSWR = useSWRMutation(
    MUTATION_KEYS.chats.rename,
    async (_, { arg }: { arg: RenameChatParams }) => {
      const { id, name } = arg;

      // Optimistically update all chat caches that might contain this chat
      await mutate(
        findCacheKeysByPattern(['chats']),
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
        }
      );

      // Make API call to update on server
      await ChatsService.updateChatDetails(id, { name });

      return { id, name };
    },
    swrMutationConfig
  );

  const renameChat = async (id: string, name: string) => {
    return renameChatSWR.trigger({ id, name });
  };

  return {
    renameChat,
    isMutating: renameChatSWR.isMutating,
    error: renameChatSWR.error,
  };
};
