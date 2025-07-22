import { useSWRConfig } from 'swr/_internal';
import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@shared/services/chats/chatsService';

type DeleteChatFetcherArgs = {
  arg: {
    id: string;
  };
};

const fetcher = async (_key: string, { arg }: DeleteChatFetcherArgs) => {
  return ChatsService.deleteChat(arg.id);
};

export const useDeleteChat = () => {
  const { mutate } = useSWRConfig();
  const {
    trigger: deleteChat,
    isMutating: isLoading,
    error,
  } = useSWRMutation(SWRCacheKeys.DeleteChat, fetcher);

  return {
    deleteChat: async (chatId: string) => {
      await deleteChat(
        { id: chatId },
        {
          onSuccess: () => {
            mutate(SWRCacheKeys.GetChats);
          },
        }
      );
    },
    isLoading,
    error,
  };
};
