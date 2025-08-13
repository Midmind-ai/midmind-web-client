import useSWRInfinite from 'swr/infinite';

import { CACHE_KEYS } from '@/hooks/cache-keys';
import { MessagesService } from '@/services/messages/messages-service';
import type { PaginatedResponse } from '@/types/common';
import type { ChatMessage } from '@/types/entities';

export const ITEMS_PER_PAGE = 20;

export const useGetChatMessages = (chatId: string) => {
  const getKey = (
    pageIndex: number,
    previousPageData: PaginatedResponse<ChatMessage[]> | null
  ) => {
    if (previousPageData && !previousPageData.data?.length) {
      return null;
    }

    const skip = pageIndex * ITEMS_PER_PAGE;

    return `${CACHE_KEYS.messages.chat(chatId)}?page=${pageIndex}&skip=${skip}&take=${ITEMS_PER_PAGE}`;
  };

  const {
    data: pages,
    isLoading,
    error,
    size,
    setSize,
    isValidating,
  } = useSWRInfinite(
    getKey,
    key => {
      const pageIndex = parseInt(key.split('page=')[1]?.split('&')[0] || '0');
      const skip = pageIndex * ITEMS_PER_PAGE;

      return MessagesService.getChatMessages(chatId, {
        skip,
        take: ITEMS_PER_PAGE,
      });
    },
    {
      revalidateFirstPage: false,
    }
  );

  const messages = (() => {
    const messageMap = new Map<string, ChatMessage>();

    for (const page of pages || []) {
      for (const message of page.data || []) {
        if (!messageMap.has(message.id)) {
          messageMap.set(message.id, message);
        }
      }
    }

    return Array.from(messageMap.values()).reverse();
  })();

  const hasMore =
    pages && pages.length > 0 && pages[pages.length - 1]?.meta?.next !== null;

  const loadMore = () => {
    if (!isValidating && hasMore) {
      setSize(size + 1);
    }
  };

  return {
    isLoading,
    messages,
    error,
    hasMore,
    loadMore,
    isValidating,
  };
};
