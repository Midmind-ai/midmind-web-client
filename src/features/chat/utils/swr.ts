import { unstable_serialize } from 'swr/infinite';

import { SWRCacheKeys } from '@shared/constants/api';

import { BranchContextService } from '@shared/services/branch-context/branch-context-service';
import type { ConversationWithAIResponseDto } from '@shared/services/conversations/conversations-dtos';

import type { PaginatedResponse } from '@shared/types/common';
import type { ChatMessage } from '@shared/types/entities';

import { ITEMS_PER_PAGE } from '@features/chat/hooks/use-get-chat-messages';
import type { LLModel } from '@features/chat/types/chat-types';
import { emitResponseChunk } from '@features/chat/utils/llm-response-emitter';

import type { components } from 'generated/api-types';

type ChatDetails = components['schemas']['ChatDto'];
type TitleChunk = components['schemas']['CreateConversationResponseTitleDto'];

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
const createdMessages = new Set<string>();

export const handleLLMResponse = async (
  mutate: ReturnType<typeof import('swr').useSWRConfig>['mutate'],
  clearAbortController: (chatId: string) => void,
  chatId: string,
  model: LLModel,
  chunk: ConversationWithAIResponseDto,
  parentMessageId?: string,
  parentChatId?: string
) => {
  emitResponseChunk(chunk);

  if (chunk.id && chunk.type === 'content' && chunk.body) {
    if (!messageChunks.has(chunk.id)) {
      messageChunks.set(chunk.id, []);
    }

    messageChunks.get(chunk.id)?.push(chunk.body);

    if (!createdMessages.has(chunk.id)) {
      createdMessages.add(chunk.id);

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
              {
                id: chunk.id,
                content: chunk.body,
                role: 'model',
                created_at: new Date().toISOString(),
                branches: [],
                llm_model: model,
              },
              ...messages,
            ],
          };

          return updatedData;
        },
        { revalidate: false, populateCache: true }
      );
    }
  }

  if (chunk.type === 'title' && 'title' in chunk && 'chat_id' in chunk) {
    const titleChunk = chunk as TitleChunk;

    document.title = titleChunk.title;

    mutate(
      SWRCacheKeys.GetChatDetails(titleChunk.chat_id),
      (data: ChatDetails | undefined) => {
        if (data) {
          return { ...data, name: titleChunk.title };
        }

        return data;
      },
      { revalidate: false, populateCache: true }
    );

    mutate(
      SWRCacheKeys.GetChats,
      (data: ChatDetails[] | undefined) => {
        if (data) {
          return data.map((chat: ChatDetails) =>
            chat.id === titleChunk.chat_id ? { ...chat, name: titleChunk.title } : chat
          );
        }

        return data;
      },
      { revalidate: false, populateCache: true }
    );
  }

  if (chunk.type === 'complete') {
    clearAbortController(chatId);

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

      messageChunks.delete(chunk.id);
      createdMessages.delete(chunk.id);

      if (parentChatId && parentMessageId) {
        const branchContext =
          await BranchContextService.getBranchContext(parentMessageId);

        await mutate(
          getInfiniteKey(parentChatId),
          (data?: PaginatedResponse<ChatMessage[]>[]) => {
            if (!data || !Array.isArray(data) || data.length === 0) {
              return data;
            }

            const updatedData = data.map(page => ({
              ...page,
              data:
                page.data?.map(message =>
                  message.id === parentMessageId
                    ? { ...message, branches: branchContext }
                    : message
                ) || [],
            }));

            return updatedData;
          },
          {
            revalidate: false,
            populateCache: true,
          }
        );
      }
    }

    return;
  }
};
