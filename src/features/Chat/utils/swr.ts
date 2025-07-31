import { unstable_serialize } from 'swr/infinite';

import { ITEMS_PER_PAGE } from '@/features/Chat/hooks/useGetChatMessages';
import { emitResponseChunk } from '@/features/Chat/utils/llmResponseEmitter';
import { SWRCacheKeys } from '@/shared/constants/api';
import type { ConversationWithAIResponse } from '@/shared/services/chats/types';
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

export const handleLLMResponse = (
  mutate: ReturnType<typeof import('swr').useSWRConfig>['mutate'],
  chatId: string,
  chunk: ConversationWithAIResponse
) => {
  emitResponseChunk(chunk);

  if (chunk.id && chunk.type === 'content') {
    mutate(
      getInfiniteKey(chatId),
      (data?: PaginatedResponse<ChatMessage[]>[]) => {
        if (!data || !Array.isArray(data) || data.length === 0) {
          return data;
        }

        const updatedData = [...data];

        const pageIndex = updatedData.findIndex(
          page => page.data?.findIndex(message => message.id === chunk.id) !== -1
        );

        if (pageIndex !== -1) {
          const page = updatedData[pageIndex];
          const messageIndex = page.data?.findIndex(message => message.id === chunk.id);

          if (messageIndex !== undefined && messageIndex !== -1 && page.data) {
            updatedData[pageIndex] = {
              ...page,
              data: page.data.map((message, index) =>
                index === messageIndex
                  ? { ...message, content: message.content + chunk.body }
                  : message
              ),
            };
          }
        } else if (updatedData[0]) {
          const llmResponse: ChatMessage = {
            id: chunk.id,
            content: chunk.body,
            role: 'model',
            threads: [],
            llm_model: null,
          };

          updatedData[0] = {
            ...updatedData[0],
            data: [...(updatedData[0].data || []), llmResponse],
          };
        }

        return updatedData;
      },
      {
        revalidate: false,
        populateCache: true,
      }
    );
  }
};
