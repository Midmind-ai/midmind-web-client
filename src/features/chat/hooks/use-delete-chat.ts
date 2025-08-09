import { produce } from 'immer';
import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@shared/services/chats/chats-service';

import type { Chat } from '@shared/types/entities';

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
    async (_key: string, { arg }: DeleteChatFetcherArgs) => {
      return ChatsService.deleteChat(arg.id);
    }
  );

  const deleteChat = async (chatId: string) => {
    await trigger(
      { id: chatId },
      {
        onSuccess: () => {
          mutate(
            SWRCacheKeys.GetChats,
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
