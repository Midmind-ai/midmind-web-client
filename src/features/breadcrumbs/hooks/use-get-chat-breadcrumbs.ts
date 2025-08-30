import { CACHE_KEYS } from '@hooks/cache-keys';

import type { GetChatBreadcrumbsResponseDto } from '@services/breadcrumbs/breadcrumbs-dtos';
import { BreadcrumbsService } from '@services/breadcrumbs/breadcrumbs-service';

import { useSWR } from '@lib/swr';

export const useGetChatBreadcrumbs = (chatId: string) => {
  const { data, isLoading, error } = useSWR(CACHE_KEYS.chats.breadcrumbs(chatId), () =>
    BreadcrumbsService.getChatBreadcrumbs(chatId)
  );

  return { data: data as GetChatBreadcrumbsResponseDto | undefined, isLoading, error };
};
