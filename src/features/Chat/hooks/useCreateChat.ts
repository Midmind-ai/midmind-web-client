import { useSWRConfig } from 'swr/_internal';
import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@shared/services/chats/chatsService';

import type { Chat } from '@shared/types/entities';

export const useCreateChat = () => {
  const { mutate } = useSWRConfig();
  const {
    trigger: createChat,
    isMutating: isLoading,
    error,
  } = useSWRMutation(SWRCacheKeys.CreateChat, ChatsService.createChat);

  return {
    createChat: async () => {
      await createChat(null, {
        onSuccess: data => {
          mutate(
            SWRCacheKeys.GetChats,
            (existingChats?: Chat[]) => {
              if (!existingChats) {
                return [data];
              }

              return [...existingChats, data];
            },
            false
          );
        },
      });
    },
    isLoading,
    error,
  };
};
