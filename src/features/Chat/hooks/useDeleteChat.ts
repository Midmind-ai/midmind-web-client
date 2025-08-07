import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import type { Chat } from '@shared/types/entities';

import { ChatsService } from '@/shared/services/chats/chats.service';

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
            (existingChats?: Chat[]) => {
              if (!existingChats) {
                return [];
              }

              return existingChats.filter(chat => chat.id !== chatId);
            },
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
