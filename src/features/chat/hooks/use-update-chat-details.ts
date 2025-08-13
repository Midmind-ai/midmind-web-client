import { produce } from 'immer';
import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@/constants/api';
import type { UpdateChatDetailsRequestDto } from '@/services/chats/chats-dtos';
import { ChatsService } from '@/services/chats/chats-service';
import type { Chat } from '@/types/entities';
import { CacheSelectors } from '@/utils/cache-selectors';

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
    async (_key: readonly unknown[], { arg }: UpdateChatDetailsFetcherArgs) => {
      return ChatsService.updateChatDetails(arg.id, arg.body);
    }
  );

  const updateChatDetails = async (id: string, body: UpdateChatDetailsRequestDto) => {
    await trigger(
      { id, body },
      {
        onSuccess: () => {
          // Update the specific chat details cache
          mutate(SWRCacheKeys.GetChatDetails(id), { ...body, id }, false);

          // Also update the chat name in all chat lists if the name changed
          if (body.name) {
            mutate(
              CacheSelectors.allChats,
              produce((draft?: Chat[]) => {
                if (!draft) {
                  return;
                }

                const chatIndex = draft.findIndex(chat => chat.id === id);
                if (chatIndex !== -1 && body.name) {
                  draft[chatIndex].name = body.name;
                }
              }),
              false
            );
          }
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
