import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import type { ChatsStoreState } from './chats.store';
import type { SSEEvent } from '@services/chats/sse-events';
import type { AIModel, ChatMessage } from '@shared-types/entities';

// ============================================================================
// OPTIMISTIC MESSAGE CREATORS (Pure Functions)
// ============================================================================

/**
 * Creates an optimistic user message for immediate UI display
 */
export const createOptimisticUserMessage = (params: {
  id: string;
  chatId: string;
  content: string;
  model: AIModel;
  replyContext: { content: string } | null;
  attachments: ChatMessage['attachments'];
}): ChatMessage => ({
  id: params.id,
  chat_id: params.chatId,
  user_id: null,
  content: params.content,
  role: 'user',
  created_at: new Date().toISOString(),
  llm_model: params.model as ChatMessage['llm_model'],
  is_draft: false,
  nested_chats: [],
  reply_content: params.replyContext?.content || null,
  attachments: params.attachments,
});

/**
 * Creates an optimistic AI message for streaming
 */
export const createOptimisticAIMessage = (params: {
  id: string;
  chatId: string;
  model: AIModel;
}): ChatMessage => ({
  id: params.id,
  chat_id: params.chatId,
  user_id: null,
  content: '',
  role: 'model',
  created_at: new Date().toISOString(),
  llm_model: params.model as ChatMessage['llm_model'],
  is_draft: false,
  nested_chats: [],
  reply_content: null,
  attachments: [],
});

/**
 * Creates local attachment objects from files
 */
export const createLocalAttachments = (
  files: File[],
  attachments: ChatMessage['attachments']
): Array<{ id: string; file_name: string; download_url: string }> => {
  return files.map((file, index) => ({
    id: attachments[index]?.id || uuid(),
    file_name: file.name,
    download_url: URL.createObjectURL(file),
  }));
};

// ============================================================================
// SSE STREAM HANDLERS (Internal)
// ============================================================================

/**
 * Handles content chunks during streaming
 */
const handleContentChunk = (
  set: (updater: (state: ChatsStoreState) => Partial<ChatsStoreState>) => void,
  chatId: string,
  aiMessageId: string,
  accumulatedContent: string
) => {
  set(state => ({
    chats: {
      ...state.chats,
      [chatId]: {
        ...state.chats[chatId],
        messages: state.chats[chatId].messages.map(msg =>
          msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg
        ),
      },
    },
  }));
};

/**
 * Handles title updates for the chat
 */
const handleTitleUpdate = (
  set: (updater: (state: ChatsStoreState) => Partial<ChatsStoreState>) => void,
  chatId: string,
  title: string
) => {
  set(state => ({
    chats: {
      ...state.chats,
      [chatId]: {
        ...state.chats[chatId],
        chat: state.chats[chatId].chat
          ? { ...state.chats[chatId].chat, name: title }
          : state.chats[chatId].chat,
      },
    },
  }));
  // Update document title
  document.title = title;
};

/**
 * Handles stream completion
 */
const handleStreamComplete = (
  set: (updater: (state: ChatsStoreState) => Partial<ChatsStoreState>) => void,
  chatId: string,
  aiMessageId: string,
  finalContent: string
) => {
  set(state => ({
    chats: {
      ...state.chats,
      [chatId]: {
        ...state.chats[chatId],
        messages: state.chats[chatId].messages.map(msg =>
          msg.id === aiMessageId ? { ...msg, content: finalContent } : msg
        ),
        isStreaming: false,
        streamingMessageId: null,
        abortController: null,
      },
    },
  }));
};

/**
 * Handles streaming errors
 */
const handleStreamErrorInternal = (
  set: (updater: (state: ChatsStoreState) => Partial<ChatsStoreState>) => void,
  chatId: string,
  aiMessageId: string,
  errorMessage: string
) => {
  toast.error(errorMessage, { duration: 5000 });
  console.error(errorMessage);

  set(state => ({
    chats: {
      ...state.chats,
      [chatId]: {
        ...state.chats[chatId],
        error: errorMessage,
        isStreaming: false,
        streamingMessageId: null,
        abortController: null,
        // Remove the empty AI message on error
        messages: state.chats[chatId].messages.filter(msg => msg.id !== aiMessageId),
      },
    },
  }));
};

// ============================================================================
// STREAM PROCESSOR FACTORY
// ============================================================================

/**
 * Creates a stream processor function with encapsulated state
 * Returns a function that processes SSE events
 */
export const createStreamProcessor = (
  set: (updater: (state: ChatsStoreState) => Partial<ChatsStoreState>) => void,
  chatId: string,
  aiMessageId: string
) => {
  // Encapsulated state - lives in closure
  let accumulatedContent = '';
  let titleUpdated = false;

  // Return the processor function
  return (chunk: SSEEvent) => {
    switch (chunk.type) {
      case 'content':
        if (chunk.content) {
          accumulatedContent += chunk.content;
          handleContentChunk(set, chatId, aiMessageId, accumulatedContent);
        }
        break;

      case 'title':
        if (chunk.content && !titleUpdated) {
          titleUpdated = true;
          handleTitleUpdate(set, chatId, chunk.content);
        }
        break;

      case 'complete':
        handleStreamComplete(set, chatId, aiMessageId, accumulatedContent);
        break;

      case 'error':
        handleStreamErrorInternal(
          set,
          chatId,
          aiMessageId,
          chunk.content || 'An error occurred'
        );
        break;
    }
  };
};

/**
 * Exported error handler for use in catch blocks
 */
export const handleStreamError = (
  set: (updater: (state: ChatsStoreState) => Partial<ChatsStoreState>) => void,
  chatId: string,
  aiMessageId: string,
  errorMessage: string
) => {
  handleStreamErrorInternal(set, chatId, aiMessageId, errorMessage);
};
