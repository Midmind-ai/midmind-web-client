import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { ChatsService } from '@shared/services/chats/chatsService';

import { SWRCacheKeys } from '@/shared/constants/api';
import type { UpdateChatDetailsRequest } from '@/shared/services/chats/types';

type UpdateChatDetailsFetcherArgs = {
  arg: {
    id: string;
    body: UpdateChatDetailsRequest;
  };
};

const fetcher = async (_key: string, { arg }: UpdateChatDetailsFetcherArgs) => {
  return ChatsService.updateChatDetails(arg.id, arg.body);
};

export const useUpdateChatDetails = () => {
  const { mutate } = useSWRConfig();
  const {
    trigger: updateChatDetails,
    isMutating: isLoading,
    error,
  } = useSWRMutation(SWRCacheKeys.UpdateChatDetails, fetcher);

  return {
    updateChatDetails: async (id: string, body: UpdateChatDetailsRequest) => {
      await updateChatDetails({ id, body });
      mutate(SWRCacheKeys.GetChatDetails(id), { ...body, id }, false);
    },
    isLoading,
    error,
  };
};
