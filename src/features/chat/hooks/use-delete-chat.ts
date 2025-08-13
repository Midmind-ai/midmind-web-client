import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { MUTATION_KEYS, invalidateCachePattern } from '@/hooks/cache-keys';
import { ChatsService } from '@/services/chats/chats-service';

type DeleteChatFetcherArgs = {
  arg: {
    id: string;
  };
};

export const useDeleteChat = () => {
  const { mutate } = useSWRConfig();
  const {
    trigger,
    isMutating: isLoading,
    error,
  } = useSWRMutation(
    MUTATION_KEYS.chats.delete,
    async (_key: string, { arg }: DeleteChatFetcherArgs) => {
      return ChatsService.deleteChat(arg.id);
    }
  );

  const deleteChat = async (chatId: string) => {
    await trigger(
      { id: chatId },
      {
        onSuccess: () => {
          // Invalidate all chat-related caches to let SWR refetch correctly
          mutate(invalidateCachePattern(['chats'])); // Root chats
          mutate(invalidateCachePattern(['chats', 'directory', '*'])); // Directory chats
          mutate(invalidateCachePattern(['chats', 'chat', '*'])); // Branch chats

          // Invalidate the specific chat details cache
          mutate(['chat', chatId], undefined, false);

          // Invalidate message cache for this chat
          mutate(invalidateCachePattern(['messages', chatId, '*']));
        },
      }
    );
  };

  return {
    deleteChat,
    isLoading,
    error,
  };
};
