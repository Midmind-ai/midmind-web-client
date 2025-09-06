import { CACHE_KEYS } from '@hooks/cache-keys';

import { ChatsService } from '@services/chats/chats-service';

import { useEntityCreationStateStore } from '@stores/entity-creation-state.store';

import type { Chat } from '@shared-types/entities';

import { useSWR } from '@lib/swr';

export const useGetChatDetails = (id: string) => {
  const isCreating = useEntityCreationStateStore(state => state.isCreating(id));

  const {
    data: chatDetails,
    isLoading: isLoading,
    error,
  } = useSWR<Chat>(
    // Skip API call if chat is being created
    isCreating ? null : CACHE_KEYS.chats.details(id),
    () => ChatsService.getChatDetails(id),
    {
      shouldRetryOnError: (error: unknown) => {
        // Don't retry on 500 errors (server issues) or 404 (chat not found)
        if (
          error &&
          typeof error === 'object' &&
          'response' in error &&
          error.response &&
          typeof error.response === 'object' &&
          'status' in error.response
        ) {
          const status = (error.response as { status: number }).status;
          if (status === 500 || status === 404) {
            return false;
          }
        }

        return true;
      },
      errorRetryCount: 3, // Limit retry attempts
      errorRetryInterval: 1000, // 1 second between retries
    }
  );

  return {
    chatDetails,
    isLoading: isLoading || isCreating,
    error,
  };
};
