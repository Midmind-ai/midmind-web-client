import { unstable_serialize } from 'swr/infinite';

import { ITEMS_PER_PAGE } from '@/features/Chat/hooks/useGetChatMessages';
import type { LLModel } from '@/features/Chat/types/chatTypes';
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

const messageChunks = new Map<string, string[]>();

export const handleLLMResponse = (
  mutate: ReturnType<typeof import('swr').useSWRConfig>['mutate'],
  clearAbortController: VoidFunction,
  chatId: string,
  model: LLModel,
  chunk: ConversationWithAIResponse
) => {
  emitResponseChunk(chunk);

  if (chunk.type === 'complete') {
    clearAbortController();

    if (chunk.id && messageChunks.has(chunk.id)) {
      const chunks = messageChunks.get(chunk.id);
      const completeContent = chunks?.join('') || '';

      if (completeContent) {
        mutate(
          getInfiniteKey(chatId),
          (data?: PaginatedResponse<ChatMessage[]>[]) => {
            const messages = data?.[0]?.data || [];
            const messageMap = new Map(messages.map((msg: ChatMessage) => [msg.id, msg]));

            if (messageMap.get(chunk.id)) {
              const updatedMessages = messages.map((msg: ChatMessage) =>
                msg.id === chunk.id ? { ...msg, content: completeContent } : msg
              );

              return data?.map((page, index) =>
                index === 0 ? { ...page, data: updatedMessages } : page
              );
            }

            return data;
          },
          { revalidate: false, populateCache: true }
        );
      }

      messageChunks.clear();
    }

    return;
  }

  if (chunk.id && chunk.type === 'content' && chunk.body) {
    if (!messageChunks.has(chunk.id)) {
      messageChunks.set(chunk.id, []);

      mutate(
        getInfiniteKey(chatId),
        (data?: PaginatedResponse<ChatMessage[]>[]) => {
          if (!data?.[0]) {
            return data;
          }

          const messages = data[0].data || [];

          const updatedData = [...data];
          updatedData[0] = {
            ...updatedData[0],
            data: [
              ...messages,
              {
                id: chunk.id,
                content: chunk.body,
                role: 'model',
                threads: [],
                llm_model: model,
              },
            ],
          };

          return updatedData;
        },
        { revalidate: false, populateCache: true }
      );
    }

    messageChunks.get(chunk.id)?.push(chunk.body);
  }
};
