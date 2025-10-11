import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useEntityCreationStateStore } from '../../../stores/entity-creation-state.store';
import { scrollToBottom } from '../utils/scroll-utils';
import {
  createChatBranchesSlice,
  type ChatBranchesSlice,
} from './slices/chat-branches.slice.store';
import {
  createOptimisticUserMessage,
  createOptimisticAIMessage,
  createLocalAttachments,
  createStreamProcessor,
  handleStreamError,
} from './streaming';
import { AI_MODELS } from '@constants/ai-models';
import { ChatsService } from '@services/chats/chats-service';
import type { GetFileResponseDto } from '@services/files/files-dtos';
import { FilesService } from '@services/files/files-service';
import type { AIModel, ChatMessage, Chat } from '@shared-types/entities';
import type { components } from 'generated/api-types-new';

const ITEMS_PER_PAGE = 20;
const DEFAULT_MODEL = AI_MODELS.GEMINI_2_0_FLASH_LITE.id;

// Initial state for a single chat
const getInitialChatState = (): ChatState => ({
  chat: null,
  messages: [],
  draftMessage: null,
  attachments: [],
  isLoadingChat: false,
  isLoadingMessages: false,
  isStreaming: false,
  streamingMessageId: null,
  error: null,
  hasMoreMessages: false,
  currentPage: 0,
  abortController: null,
  replyContext: null,
});

/**
 * Helper to normalize messages from backend
 * Adds default values for fields that backend doesn't populate yet
 */
const enrichMessage = (msg: components['schemas']['MessageResponse']): ChatMessage => {
  const backendMsg = msg as components['schemas']['MessageResponse'] &
    Partial<Pick<ChatMessage, 'nested_chats' | 'attachments'>>;

  return {
    ...backendMsg,
    reply_content: backendMsg.reply_content ?? null,
    nested_chats: backendMsg.nested_chats ?? [],
    attachments: backendMsg.attachments ?? [],
  };
};

// UI State types
export interface ChatState {
  chat: Chat | null;
  messages: ChatMessage[];
  draftMessage: ChatMessage | null;
  attachments: GetFileResponseDto[];
  isLoadingChat: boolean;
  isLoadingMessages: boolean;
  isStreaming: boolean;
  streamingMessageId: string | null;
  error: string | null;
  hasMoreMessages: boolean;
  currentPage: number;
  abortController: AbortController | null;
  replyContext: components['schemas']['ReplyToDto'] | null;
}

export interface ChatsStoreState extends ChatBranchesSlice {
  // Multiple chats support
  chats: Record<string, ChatState>;
  isCreatingNewChat: boolean;

  // Actions
  updateChatState: (chatId: string, updates: Partial<ChatState>) => void;
  initChatData: (chatId: string) => void;
  initChat: (chatId: string) => void;
  setReplyContext: (
    chatId: string,
    replyContext: { id: string; content: string } | null
  ) => void;
  loadChat: (chatId: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  loadDraftMessage: (chatId: string) => Promise<void>;
  loadMoreMessages: (chatId: string) => Promise<void>;
  sendMessage: (
    chatId: string,
    content: string,
    model?: AIModel,
    attachments?: ChatMessage['attachments'],
    attachmentFiles?: File[]
  ) => Promise<void>;
  stopStreaming: (chatId: string) => void;
  loadAttachments: (messages: ChatMessage[]) => Promise<GetFileResponseDto[]>;
  clearChat: (chatId: string) => void;
  setError: (chatId: string, error: string | null) => void;
  addAttachments: (
    chatId: string,
    attachments: { id: string; file_name: string; download_url: string }[]
  ) => void;
}

export const useChatsStore = create<ChatsStoreState>()(
  devtools(
    (...a) => {
      const [set, get] = a;

      return {
        // Merge chat branches slice
        ...createChatBranchesSlice(...a),

        // Initial state
        chats: {},
        isCreatingNewChat: false,

        /**
         * Update chat state without repetitive object spreading
         * Can be used by other parts of the code or future slices
         */
        updateChatState: (chatId: string, updates: Partial<ChatState>) => {
          set((state: ChatsStoreState) => ({
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                ...updates,
              },
            },
          }));
        },

        initChatData: (chatId: string) => {
          const isChatCreatingProcess = useEntityCreationStateStore
            .getState()
            .isCreating(chatId);

          if (isChatCreatingProcess) return;

          useChatsStore.getState().initChat(chatId);
          useChatsStore.getState().loadMessages(chatId);
          useChatsStore.getState().loadDraftMessage(chatId);
        },

        // Initialize chat if not exists
        initChat: (chatId: string) => {
          const { chats } = get();
          if (!chats[chatId]) {
            set(state => ({
              chats: {
                ...state.chats,
                [chatId]: getInitialChatState(),
              },
            }));
          }
        },

        // Load chat details
        loadChat: async (chatId: string) => {
          get().initChat(chatId);

          get().updateChatState(chatId, {
            isLoadingChat: true,
            error: null,
          });

          try {
            // const chatDetails = await ChatsService.getChatDetails(chatId);
            // get().updateChatState(chatId, { chat: chatDetails });
          } catch (error) {
            get().updateChatState(chatId, {
              error: error instanceof Error ? error.message : 'Failed to load chat',
            });
          } finally {
            get().updateChatState(chatId, {
              isLoadingChat: false,
            });
          }
        },

        // Load initial messages
        loadMessages: async (chatId: string) => {
          get().initChat(chatId);

          get().updateChatState(chatId, {
            isLoadingMessages: true,
            error: null,
            currentPage: 0,
          });

          try {
            const response = await ChatsService.getMessages(chatId, {
              offset: 0,
              limit: ITEMS_PER_PAGE,
            });

            const messages = response.messages.map(enrichMessage);
            const attachments = await get().loadAttachments(messages);

            get().updateChatState(chatId, {
              messages: messages.reverse(),
              hasMoreMessages: messages.length === ITEMS_PER_PAGE,
              isLoadingMessages: false,
              currentPage: 1,
              attachments,
            });
          } catch (error) {
            get().updateChatState(chatId, {
              error: error instanceof Error ? error.message : 'Failed to load messages',
              isLoadingMessages: false,
            });
          }
        },

        // Load draft message
        loadDraftMessage: async (chatId: string) => {
          get().initChat(chatId);

          try {
            const draftMessage = await ChatsService.getDraftMessage(chatId);

            const enrichedDraft = enrichMessage(draftMessage);

            // Extract reply context from draft if exists
            const replyContext =
              draftMessage.reply_to_message_id && draftMessage.reply_content
                ? {
                    id: draftMessage.reply_to_message_id,
                    content: draftMessage.reply_content,
                  }
                : null;

            get().updateChatState(chatId, {
              draftMessage: enrichedDraft,
              replyContext,
            });

            // If draft has content and attachments, load the attachment files
            if (
              draftMessage.content &&
              draftMessage.content.trim() !== '' &&
              enrichedDraft.attachments.length > 0
            ) {
              const draftAttachments = await get().loadAttachments([enrichedDraft]);

              get().updateChatState(chatId, {
                attachments: draftAttachments,
              });
            }
          } catch (error) {
            // Silently fail - draft message is optional
            console.error('Failed to load draft message:', error);
          }
        },

        // Load attachments
        loadAttachments: async (messages: ChatMessage[]) => {
          const fileIds = messages.flatMap(message =>
            message.attachments.map(attachment => attachment.id)
          );

          const attachments = await Promise.all(
            fileIds.map(fileId => FilesService.getFile(fileId))
          );

          return attachments;
        },

        // Load more messages (pagination)
        loadMoreMessages: async (chatId: string) => {
          const chatState = get().chats[chatId];
          if (!chatState || !chatState.hasMoreMessages || chatState.isLoadingMessages) {
            return;
          }

          get().updateChatState(chatId, {
            isLoadingMessages: true,
          });

          try {
            const response = await ChatsService.getMessages(chatId, {
              offset: chatState.currentPage * ITEMS_PER_PAGE,
              limit: ITEMS_PER_PAGE,
            });

            const messages = response.messages.map(enrichMessage);
            const attachments = await get().loadAttachments(messages);

            set(state => ({
              chats: {
                ...state.chats,
                [chatId]: {
                  ...state.chats[chatId],
                  messages: [...messages.reverse(), ...state.chats[chatId].messages],
                  hasMoreMessages: messages.length === ITEMS_PER_PAGE,
                  isLoadingMessages: false,
                  currentPage: state.chats[chatId].currentPage + 1,
                  attachments: [...attachments, ...state.chats[chatId].attachments],
                },
              },
            }));
          } catch (error) {
            get().updateChatState(chatId, {
              error:
                error instanceof Error ? error.message : 'Failed to load more messages',
              isLoadingMessages: false,
            });
          }
        },

        sendMessage: async (
          chatId: string,
          content: string,
          model = DEFAULT_MODEL,
          attachments = [],
          attachmentFiles = []
        ) => {
          // 1. Initialize chat if needed
          const chatState = get().chats[chatId];
          if (!chatState) {
            get().initChat(chatId);
          }

          // 2. Generate IDs and get reply context
          const userMessageId = uuid();
          const aiMessageId = uuid();
          const replyContext = get().chats[chatId]?.replyContext;

          // 3. Create optimistic messages using helpers
          const userMessage = createOptimisticUserMessage({
            id: userMessageId,
            chatId,
            content,
            model,
            replyContext,
            attachments,
          });

          const aiMessage = createOptimisticAIMessage({
            id: aiMessageId,
            chatId,
            model,
          });

          const localAttachments = createLocalAttachments(attachmentFiles, attachments);

          // 4. Add both messages immediately and clear reply context
          set(state => ({
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                messages: [
                  ...(state.chats[chatId]?.messages || []),
                  userMessage,
                  aiMessage,
                ],
                attachments: [
                  ...(state.chats[chatId]?.attachments || []),
                  ...localAttachments,
                ],
                isStreaming: true,
                streamingMessageId: aiMessageId,
                error: null,
                replyContext: null,
              },
            },
          }));

          scrollToBottom();

          // 5. Setup abort controller
          const abortController = new AbortController();
          get().updateChatState(chatId, { abortController });

          // 6. Stream handling with processor
          try {
            const requestData = {
              id: userMessageId,
              content,
              model,
              ...(replyContext && { reply_to: replyContext }),
              ...(attachments.length > 0 && {
                attachments: attachments.map(att => att.id),
              }),
            };

            // Create stream processor with encapsulated state
            const processChunk = createStreamProcessor(set, chatId, aiMessageId);

            // Process stream events
            await ChatsService.sendMessage(
              chatId,
              requestData,
              processChunk,
              abortController.signal
            );
          } catch (error) {
            // Handle network errors or aborted requests
            if (error instanceof Error && error.name !== 'AbortError') {
              handleStreamError(set, chatId, aiMessageId, error.message);
            }
          }
        },

        // Stop streaming
        stopStreaming: (chatId: string) => {
          const chatState = get().chats[chatId];
          if (chatState?.abortController) {
            chatState.abortController.abort();
            get().updateChatState(chatId, {
              isStreaming: false,
              streamingMessageId: null,
              abortController: null,
            });
          }
        },

        // Clear chat data
        clearChat: (chatId: string) => {
          const chatState = get().chats[chatId];
          if (chatState?.abortController) {
            chatState.abortController.abort();
          }

          set(state => {
            const newChats = { ...state.chats };
            delete newChats[chatId];

            return {
              chats: newChats,
            };
          });
        },

        // Set reply context
        setReplyContext: (
          chatId: string,
          replyContext: { id: string; content: string } | null
        ) => {
          get().updateChatState(chatId, { replyContext });
        },

        // Set error
        setError: (chatId: string, error: string | null) => {
          get().updateChatState(chatId, { error });
        },

        // Add attachments to chat store
        addAttachments: (
          chatId: string,
          attachments: { id: string; file_name: string; download_url: string }[]
        ) => {
          set(state => ({
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                attachments: [
                  ...(state.chats[chatId]?.attachments || []),
                  ...attachments,
                ],
              },
            },
          }));
        },
      };
    },
    {
      name: 'chats-store',
    }
  )
);
