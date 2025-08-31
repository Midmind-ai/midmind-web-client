import { CACHE_KEYS } from '@hooks/cache-keys';

import { ChatsService } from '@services/chats/chats-service';

import { useEntityCreationStore } from '@stores/use-entity-creation.store';

import type { Chat } from '@shared-types/entities';

import { useSWR } from '@lib/swr';

export const useGetChatDetails = (id: string) => {
  const isCreating = useEntityCreationStore(state => state.isCreating(id));

  const {
    data: chatDetails,
    isLoading: isLoading,
    error,
  } = useSWR<Chat>(
    // Skip API call if chat is being created
    isCreating ? null : CACHE_KEYS.chats.details(id),
    () => ChatsService.getChatDetails(id),
    {
      shouldRetryOnError: true,
    }
  );

  return {
    chatDetails,
    isLoading: isLoading || isCreating,
    error,
  };
};
