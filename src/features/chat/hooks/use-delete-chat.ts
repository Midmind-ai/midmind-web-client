import { produce } from 'immer';
import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@/constants/api';
import { ChatsService } from '@/services/chats/chats-service';
import type { Chat } from '@/types/entities';
import { CacheSelectors } from '@/utils/cache-selectors';

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
    SWRCacheKeys.DeleteChat,
    async (_key: readonly unknown[], { arg }: DeleteChatFetcherArgs) => {
      return ChatsService.deleteChat(arg.id);
    }
  );

  const deleteChat = async (chatId: string) => {
    await trigger(
      { id: chatId },
      {
        onSuccess: () => {
          // Update all chat lists (root, directory-based, and branch-based)
          mutate(
            CacheSelectors.allChats,
            produce((draft?: Chat[]) => {
              if (!draft) {
                return;
              }

              const chatIndex = draft.findIndex(chat => chat.id === chatId);

              if (chatIndex !== -1) {
                draft.splice(chatIndex, 1);
              }
            }),
            false
          );

          // Also invalidate the specific chat details cache
          mutate(CacheSelectors.specificChatDetails(chatId), undefined, false);

          // Invalidate message cache for this chat
          mutate(CacheSelectors.chatMessages(chatId), undefined, false);
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
