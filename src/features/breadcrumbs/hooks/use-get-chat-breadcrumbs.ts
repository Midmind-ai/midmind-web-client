import useSWR from 'swr';

import { CACHE_KEYS } from '@hooks/cache-keys';

import type { GetChatBreadcrumbsResponse } from '@services/breadcrumbs/breadcrumbs-dtos';
import { BreadcrumbsService } from '@services/breadcrumbs/breadcrumbs-service';

export const useGetChatBreadcrumbs = (chatId: string) => {
  const { data, isLoading, error } = useSWR<GetChatBreadcrumbsResponse>(
    CACHE_KEYS.chats.breadcrumbs(chatId),
    () => BreadcrumbsService.getChatBreadcrumbs(chatId)
  );

  return { data, isLoading, error };
};
