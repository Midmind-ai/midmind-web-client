import type { components } from 'generated/api-types';

// Use generated types from API
export type Chat = components['schemas']['ChatDto'];
export type ChatMessage = components['schemas']['AppMessageDto'];
export type ConversationBranchContext =
  components['schemas']['ChatMetadataByMessageIdDto'];

// Streaming related types
export type StreamChunk = components['schemas']['CreateConversationResponseContentDto'];

// Request types
export type SendMessageRequest = components['schemas']['CreateConversationDto'];

// AI Model type from generated API
export type AIModel = components['schemas']['CreateConversationDto']['model'];

// UI State types
export interface ChatState {
  chat: Chat | null;
  messages: ChatMessage[];
  isLoadingChat: boolean;
  isLoadingMessages: boolean;
  isStreaming: boolean;
  streamingMessageId: string | null;
  error: string | null;
  hasMoreMessages: boolean;
  currentPage: number;
  abortController: AbortController | null;
}

export interface ChatsStoreState {
  // Multiple chats support
  chats: Record<string, ChatState>;
  activeChatIds: string[];

  // Actions
  initChat: (chatId: string) => void;
  loadChat: (chatId: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  loadMoreMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string, model?: AIModel) => Promise<void>;
  stopStreaming: (chatId: string) => void;
  clearChat: (chatId: string) => void;
  setError: (chatId: string, error: string | null) => void;
  addChatToActive: (chatId: string) => void;
  removeChatFromActive: (chatId: string) => void;
}
