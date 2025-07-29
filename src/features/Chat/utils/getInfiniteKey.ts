import { unstable_serialize } from 'swr/infinite';

import { ITEMS_PER_PAGE } from '@/features/Chat/hooks/useGetChatMessages';
import { SWRCacheKeys } from '@/shared/constants/api';
import type { PaginatedResponse } from '@/shared/types/common';
import type { ChatMessage } from '@/shared/types/entities';

export const getInfiniteKey = (chatId: string) => {
  return unstable_serialize(
    (pageIndex: number, previousPageData: PaginatedResponse<ChatMessage[]> | null) => {
      if (previousPageData && !previousPageData.data?.length) {
        return null;
      }
      const skip = pageIndex * ITEMS_PER_PAGE;

      return `${SWRCacheKeys.GetMessages(chatId)}?page=${pageIndex}&skip=${skip}&take=${ITEMS_PER_PAGE}`;
    }
  );
};
