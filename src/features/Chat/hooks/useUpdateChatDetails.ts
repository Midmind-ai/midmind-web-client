import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@/shared/constants/api';
import type { UpdateChatDetailsRequestDto } from '@/shared/services/chats/chats.dto';
import { ChatsService } from '@/shared/services/chats/chats.service';

type UpdateChatDetailsFetcherArgs = {
  arg: {
    id: string;
    body: UpdateChatDetailsRequestDto;
  };
};

export const useUpdateChatDetails = () => {
  const { mutate } = useSWRConfig();
  const {
    trigger,
    isMutating: isLoading,
    error,
  } = useSWRMutation(
    SWRCacheKeys.UpdateChatDetails,
    async (_key: string, { arg }: UpdateChatDetailsFetcherArgs) => {
      return ChatsService.updateChatDetails(arg.id, arg.body);
    }
  );

  const updateChatDetails = async (id: string, body: UpdateChatDetailsRequestDto) => {
    await trigger(
      { id, body },
      {
        onSuccess: () => {
          mutate(SWRCacheKeys.GetChatDetails(id), { ...body, id }, false);
        },
      }
    );
  };

  return {
    updateChatDetails,
    isLoading,
    error,
  };
};
