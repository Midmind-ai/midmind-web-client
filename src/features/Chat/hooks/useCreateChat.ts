import { useSWRConfig } from 'swr/_internal';
import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@shared/services/chats/chatsService';

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
        onSuccess: () => {
          mutate(SWRCacheKeys.GetChats);
        },
      });
    },
    isLoading,
    error,
  };
};
