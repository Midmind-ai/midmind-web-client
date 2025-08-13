import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { CACHE_KEYS, MUTATION_KEYS, invalidateCachePattern } from '@hooks/cache-keys';

import type { UpdateChatDetailsRequestDto } from '@services/chats/chats-dtos';
import { ChatsService } from '@services/chats/chats-service';

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
    MUTATION_KEYS.chats.updateDetails,
    async (_key: string, { arg }: UpdateChatDetailsFetcherArgs) => {
      return ChatsService.updateChatDetails(arg.id, arg.body);
    }
  );

  const updateChatDetails = async (id: string, body: UpdateChatDetailsRequestDto) => {
    await trigger(
      { id, body },
      {
        onSuccess: () => {
          // Update the specific chat details cache
          mutate(CACHE_KEYS.chats.details(id), { ...body, id }, false);

          // Also invalidate chat lists if the name changed
          if (body.name) {
            mutate(invalidateCachePattern(['chats'])); // Root chats
            mutate(invalidateCachePattern(['chats', 'directory', '*'])); // Directory chats
            mutate(invalidateCachePattern(['chats', 'chat', '*'])); // Branch chats
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
