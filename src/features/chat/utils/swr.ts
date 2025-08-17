import { produce } from 'immer';
import { mutate } from 'swr';
import { unstable_serialize } from 'swr/infinite';

import { ITEMS_PER_PAGE } from '@features/chat/hooks/use-get-chat-messages';
import type {
  ChunkHandlerParams,
  LLModel,
  TitleChunk,
  ChatDetails,
} from '@features/chat/types/chat-types';
import { emitResponseChunk } from '@features/chat/utils/llm-response-emitter';

import { CACHE_KEYS, findCacheKeysByPattern } from '@hooks/cache-keys';

import { BranchContextService } from '@services/branch-context/branch-context-service';
import type { ConversationWithAIResponseDto } from '@services/conversations/conversations-dtos';

import type { PaginatedResponse } from '@shared-types/common';
import type { ChatMessage } from '@shared-types/entities';

export const getInfiniteKey = (chatId: string) => {
  return unstable_serialize(
    (pageIndex: number, previousPageData: PaginatedResponse<ChatMessage[]> | null) => {
      if (previousPageData && !previousPageData.data?.length) {
        return null;
      }

      const skip = pageIndex * ITEMS_PER_PAGE;

      return `${CACHE_KEYS.messages.chat(chatId)}?page=${pageIndex}&skip=${skip}&take=${ITEMS_PER_PAGE}`;
    }
  );
};

export const handleLLMResponse = async (
  clearAbortController: (chatId: string) => void,
  chatId: string,
  model: LLModel,
  chunk: ConversationWithAIResponseDto,
  parentMessageId?: string,
  parentChatId?: string
) => {
  emitResponseChunk(chunk);

  const params: ChunkHandlerParams = {
    clearAbortController,
    chatId,
    model,
    chunk,
    parentMessageId,
    parentChatId,
  };

  switch (chunk.type) {
    case 'content':
      handleContentChunk(params);
      break;
    case 'title':
      handleTitleChunk(params);
      break;
    case 'complete':
      await handleCompleteChunk(params);
      break;
    default:
      break;
  }
};

const messageChunks = new Map<string, string[]>();
const createdMessages = new Set<string>();

const handleContentChunk = (params: ChunkHandlerParams): void => {
  const { chatId, model, chunk } = params;

  if (!chunk.id || chunk.type !== 'content' || !chunk.body) {
    return;
  }

  if (!messageChunks.has(chunk.id)) {
    messageChunks.set(chunk.id, []);
  }

  messageChunks.get(chunk.id)?.push(chunk.body);

  if (!createdMessages.has(chunk.id)) {
    createdMessages.add(chunk.id);

    mutate(
      getInfiniteKey(chatId),
      produce((draft?: PaginatedResponse<ChatMessage[]>[]) => {
        draft?.[0].data.unshift({
          id: chunk.id,
          content: chunk.body,
          role: 'model',
          created_at: new Date().toISOString(),
          branches: [],
          llm_model: model,
          reply_content: null,
        });
      }),
      { revalidate: false, populateCache: true }
    );
  }
};

const handleTitleChunk = (params: ChunkHandlerParams): void => {
  const { chunk } = params;

  if (!('title' in chunk) || !('chat_id' in chunk)) {
    return;
  }

  const titleChunk = chunk as TitleChunk;

  document.title = titleChunk.title;

  // Update individual chat details cache
  mutate(
    CACHE_KEYS.chats.details(titleChunk.chat_id),
    produce((draft?: ChatDetails) => {
      if (draft) {
        draft.name = titleChunk.title;
      }
    }),
    { revalidate: false, populateCache: true }
  );

  // Update all chat list caches that might contain this chat
  // This includes:
  // - ['chats'] - root level chats
  // - ['chats', 'directory', directoryId] - chats in directories
  // - ['chats', 'chat', parentChatId] - branch chats
  mutate(
    findCacheKeysByPattern(['chats']),
    produce((draft?: ChatDetails[]) => {
      if (draft) {
        const chatIndex = draft.findIndex(
          (chat: ChatDetails) => chat.id === titleChunk.chat_id
        );

        if (chatIndex !== -1) {
          draft[chatIndex].name = titleChunk.title;
        }
      }
    }),
    { revalidate: false, populateCache: true }
  );
};

const handleCompleteChunk = async (params: ChunkHandlerParams): Promise<void> => {
  const { clearAbortController, chatId, chunk, parentChatId, parentMessageId } = params;

  if (chunk.type !== 'complete') {
    return;
  }

  clearAbortController(chatId);

  if (!chunk.id || !messageChunks.has(chunk.id)) {
    return;
  }

  const chunks = messageChunks.get(chunk.id);
  const completeContent = chunks?.join('') || '';

  if (completeContent) {
    mutate(
      getInfiniteKey(chatId),
      produce((draft?: PaginatedResponse<ChatMessage[]>[]) => {
        if (!draft?.[0]?.data) {
          return;
        }

        const messageIndex = draft[0].data.findIndex(
          (msg: ChatMessage) => msg.id === chunk.id
        );

        if (messageIndex !== -1) {
          draft[0].data[messageIndex].content = completeContent;
        }
      }),
      { revalidate: false, populateCache: true }
    );
  }

  messageChunks.delete(chunk.id);
  createdMessages.delete(chunk.id);

  if (parentChatId && parentMessageId) {
    const branchContext = await BranchContextService.getBranchContext(parentMessageId);

    await mutate(
      getInfiniteKey(parentChatId),
      produce((draft?: PaginatedResponse<ChatMessage[]>[]) => {
        if (!draft || !Array.isArray(draft) || draft.length === 0) {
          return;
        }

        draft.forEach(page => {
          if (page.data) {
            const messageIndex = page.data.findIndex(
              message => message.id === parentMessageId
            );

            if (messageIndex !== -1) {
              page.data[messageIndex].branches = branchContext;
            }
          }
        });
      }),
      {
        revalidate: false,
        populateCache: true,
      }
    );
  }
};
