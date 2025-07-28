import useSWRInfinite from 'swr/infinite';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@/shared/services/chats/chatsService';
import type { PaginatedResponse } from '@/shared/types/common';
import type { ChatMessage } from '@/shared/types/entities';

const ITEMS_PER_PAGE = 4;

export const useGetChatMessages = (chatId: string) => {
  const getKey = (pageIndex: number, previousPageData: PaginatedResponse<ChatMessage[]> | null) => {
    if (previousPageData && !previousPageData.data?.length) {
      return null;
    }

    const skip = pageIndex * ITEMS_PER_PAGE;

    return `${SWRCacheKeys.GetMessages(chatId)}?page=${pageIndex}&skip=${skip}&take=${ITEMS_PER_PAGE}`;
  };

  const {
    data: pages,
    isLoading,
    error,
    size,
    setSize,
    isValidating,
    mutate,
  } = useSWRInfinite(
    getKey,
    key => {
      const pageIndex = parseInt(key.split('page=')[1]?.split('&')[0] || '0');
      const skip = pageIndex * ITEMS_PER_PAGE;

      return ChatsService.getChatMessages(chatId, { skip, take: ITEMS_PER_PAGE });
    },
    {
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    }
  );

  const messages = pages ? pages.flatMap(page => page.data || []).reverse() : [];

  const hasMore = pages && pages.length > 0 && pages[pages.length - 1]?.meta?.next !== null;

  const loadMore = () => {
    if (!isValidating && hasMore) {
      setSize(size + 1);
    }
  };

  const refresh = () => {
    mutate();
  };

  return {
    isLoading,
    messages,
    error,
    hasMore,
    loadMore,
    refresh,
    isValidating,
  };
};
