/* eslint-disable @typescript-eslint/no-explicit-any */
import { produce } from 'immer';
import { toast } from 'sonner';

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

import { mutate, unstable_serialize } from '@lib/swr';

export const getInfiniteKey = (chatId: string) => {
  return unstable_serialize(
    (pageIndex: number, previousPageData: PaginatedResponse<ChatMessage[]> | null) => {
      if (previousPageData && !previousPageData.data?.length) {
        return null;
      }

      const skip = pageIndex * ITEMS_PER_PAGE;

      return `${CACHE_KEYS.messages.byChatId(chatId)}?page=${pageIndex}&skip=${skip}&take=${ITEMS_PER_PAGE}`;
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
    case 'error':
      handleErrorChunk(params);
      break;
    default:
      break;
  }
};

const messageChunks = new Map<string, string[]>();

const handleContentChunk = (params: ChunkHandlerParams): void => {
  const { chunk } = params;

  if (!chunk.id || chunk.type !== 'content' || !chunk.body) {
    return;
  }

  if (!messageChunks.has(chunk.id)) {
    messageChunks.set(chunk.id, []);
  }

  messageChunks.get(chunk.id)?.push(chunk.body);
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
    }) as any,
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
    }) as any,
    { revalidate: false, populateCache: true }
  );

  mutate(
    CACHE_KEYS.chats.breadcrumbs(titleChunk.chat_id),
    produce((draft?: Array<{ id: string; name: string; type: string }>) => {
      if (draft) {
        const itemIndex = draft.findIndex(item => item.id === titleChunk.chat_id);
        if (itemIndex !== -1) {
          draft[itemIndex].name = titleChunk.title;
        }
      }
    }) as any,
    { revalidate: false, populateCache: true }
  );
};

const handleErrorChunk = (params: ChunkHandlerParams): void => {
  const { clearAbortController, chatId, chunk } = params;

  if (chunk.type !== 'error' || !('error' in chunk)) {
    return;
  }

  // Clear the abort controller since the conversation has failed
  clearAbortController(chatId);

  let errorMessage = 'An unexpected error occurred';
  let errorTitle = 'Error';

  try {
    // Parse the nested JSON error structure
    const errorData = JSON.parse(chunk.error as string);

    if (errorData?.error) {
      const { code, message, status } = errorData.error;

      // Handle specific error codes with user-friendly messages
      switch (code) {
        case 429:
          errorTitle = 'Rate Limit Exceeded';
          errorMessage =
            'AI service is currently busy. Please wait a moment before trying again.';
          break;
        case 500:
          errorTitle = 'Service Error';
          errorMessage = 'AI service is temporarily unavailable. Please try again later.';
          break;
        case 503:
          errorTitle = 'Service Unavailable';
          errorMessage = 'AI service is temporarily unavailable. Please try again later.';
          break;
        default:
          errorTitle = status
            ? status
                .replace(/_/g, ' ')
                .toLowerCase()
                .replace(/\b\w/g, (l: string) => l.toUpperCase())
            : 'Service Error';
          errorMessage =
            message || 'Something went wrong with the AI service. Please try again.';
      }
    }
  } catch {
    // Fallback for malformed error chunks
    errorMessage = 'AI service encountered an error. Please try again.';
  }

  // Show error toast with Sonner
  toast.error(errorMessage, {
    description: errorTitle !== 'Error' ? errorTitle : undefined,
    duration: 5000,
  });
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
        if (draft?.[0]?.data) {
          const messageIndex = draft[0].data.findIndex(
            (msg: ChatMessage) => msg.id === chunk.id
          );
          if (messageIndex !== -1) {
            draft[0].data[messageIndex].content = completeContent;
          }
        }
      }) as any,
      { revalidate: false, populateCache: true }
    );
  }

  messageChunks.delete(chunk.id);

  if (parentChatId && parentMessageId) {
    const branchContext = await BranchContextService.getBranchContext(parentMessageId);

    await mutate(
      getInfiniteKey(parentChatId),
      produce((draft?: PaginatedResponse<ChatMessage[]>[]) => {
        if (draft && Array.isArray(draft) && draft.length > 0) {
          draft.forEach(page => {
            if (page.data) {
              const messageIndex = page.data.findIndex(
                (message: ChatMessage) => message.id === parentMessageId
              );
              if (messageIndex !== -1) {
                page.data[messageIndex].nested_chats = branchContext;
              }
            }
          });
        }
      }) as any,
      {
        revalidate: false,
        populateCache: true,
      }
    );
  }
};
