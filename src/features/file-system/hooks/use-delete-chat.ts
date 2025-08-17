import { produce } from 'immer';
import { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';

import { swrMutationConfig } from '@config/swr';

import { CACHE_KEYS, MUTATION_KEYS, findCacheKeysByPattern } from '@hooks/cache-keys';

import { ChatsService } from '@services/chats/chats-service';

import type { Chat } from '@shared-types/entities';

type DeleteChatParams = {
  id: string;
  parentDirectoryId?: string;
  parentChatId?: string;
};

export const useDeleteChat = () => {
  const deleteChatSWR = useSWRMutation(
    MUTATION_KEYS.chats.delete,
    async (_, { arg }: { arg: DeleteChatParams }) => {
      const { id, parentDirectoryId, parentChatId } = arg;
      const cacheKey = CACHE_KEYS.chats.withParent(parentDirectoryId, parentChatId);

      await mutate(
        cacheKey,
        produce((draft?: Chat[]) => {
          if (!draft) {
            return draft;
          }

          return draft.filter(chat => chat.id !== id);
        }),
        { revalidate: false }
      );

      // Make the API call
      await ChatsService.deleteChat(id);

      // Invalidate related caches after successful deletion
      // Invalidate the specific chat details cache
      await mutate(['chat', id], undefined, false);

      // Invalidate message cache for this chat
      await mutate(findCacheKeysByPattern(['messages', id]));

      // If this is a branch chat, the parent might need to update its has_branches flag
      if (parentChatId) {
        // Invalidate all chat caches to ensure has_branches is updated
        await mutate(findCacheKeysByPattern(['chats']));
      }

      return { id, parentDirectoryId, parentChatId };
    },
    swrMutationConfig
  );

  const deleteChat = async ({
    id,
    parentDirectoryId,
    parentChatId,
  }: DeleteChatParams) => {
    return deleteChatSWR.trigger({ id, parentDirectoryId, parentChatId });
  };

  return {
    deleteChat,
    isMutating: deleteChatSWR.isMutating,
    error: deleteChatSWR.error,
  };
};
