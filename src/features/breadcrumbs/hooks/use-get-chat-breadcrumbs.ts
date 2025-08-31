import { CACHE_KEYS } from '@hooks/cache-keys';

import type { GetChatBreadcrumbsResponse } from '@services/breadcrumbs/breadcrumbs-dtos';
import { BreadcrumbsService } from '@services/breadcrumbs/breadcrumbs-service';

import { useEntityCreationStore } from '@stores/use-entity-creation.store';

import { useSWR } from '@lib/swr';

export const useGetChatBreadcrumbs = (chatId: string) => {
  const isCreating = useEntityCreationStore(state => state.isCreating(chatId));

  const { data, isLoading, error } = useSWR(
    // Skip API call if chat is being created
    isCreating ? null : CACHE_KEYS.chats.breadcrumbs(chatId),
    () => BreadcrumbsService.getChatBreadcrumbs(chatId)
  );

  return {
    data: data as GetChatBreadcrumbsResponse | undefined,
    isLoading: isLoading || isCreating,
    error,
  };
};
