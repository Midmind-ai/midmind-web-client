import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AI_MODELS } from '@constants/ai-models';
import { ChatsService } from '@services/chats/chats-service';
import type {
  ConversationWithAIRequestDto,
  ConversationWithAIResponseDto,
} from '@services/conversations/conversations-dtos';
import { ConversationsService } from '@services/conversations/conversations-service';
import { MessagesService } from '@services/messages/messages-service';
import type {
  AIModel,
  ChatMessage,
  Chat,
  ChatBranchContext,
} from '@shared-types/entities';

const ITEMS_PER_PAGE = 20;
const DEFAULT_MODEL = AI_MODELS.GEMINI_2_0_FLASH_LITE.id;

// Branch color palette
const BRANCH_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Purple
  '#98D8C8', // Mint
  '#F8B195', // Coral
];

// Initial state for a single chat
const getInitialChatState = (): ChatState => ({
  chat: null,
  messages: [],
  isLoadingChat: false,
  isLoadingMessages: false,
  isStreaming: false,
  streamingMessageId: null,
  error: null,
  hasMoreMessages: false,
  currentPage: 0,
  abortController: null,
});

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
  isCreatingNewChat: boolean;

  // Actions
  initChat: (chatId: string) => void;
  loadChat: (chatId: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  loadMoreMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string, model?: AIModel) => Promise<void>;
  stopStreaming: (chatId: string) => void;
  appendNewNestedChat: (args: {
    newChatId: string;
    parentChatId: string;
    parentMessageId: string;
    connectionType: 'attached' | 'detached' | 'temporary';
  }) => [ChatBranchContext, VoidFunction];
  clearChat: (chatId: string) => void;
  setError: (chatId: string, error: string | null) => void;
  addChatToActive: (chatId: string) => void;
  removeChatFromActive: (chatId: string) => void;
}

export const useChatsStore = create<ChatsStoreState>()(
  devtools(
    (set, get) => ({
      // Initial state
      chats: {},
      activeChatIds: [],
      isCreatingNewChat: false,

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

        set(state => ({
          chats: {
            ...state.chats,
            [chatId]: {
              ...state.chats[chatId],
              isLoadingChat: true,
              error: null,
            },
          },
        }));

        try {
          const chatDetails = await ChatsService.getChatDetails(chatId);
          set(state => ({
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                chat: chatDetails,
                isLoadingChat: false,
              },
            },
          }));
        } catch (error) {
          set(state => ({
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                error: error instanceof Error ? error.message : 'Failed to load chat',
              },
            },
          }));
        } finally {
          set(state => ({
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                isLoadingChat: false,
              },
            },
          }));
        }
      },

      // Load initial messages
      loadMessages: async (chatId: string) => {
        get().initChat(chatId);

        set(state => ({
          chats: {
            ...state.chats,
            [chatId]: {
              ...state.chats[chatId],
              isLoadingMessages: true,
              error: null,
              currentPage: 0,
            },
          },
        }));

        try {
          const response = await MessagesService.getChatMessages(chatId, {
            skip: 0,
            take: ITEMS_PER_PAGE,
          });

          set(state => ({
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                messages: response.data.reverse(),
                hasMoreMessages: response.data.length === ITEMS_PER_PAGE,
                isLoadingMessages: false,
                currentPage: 1,
              },
            },
          }));
        } catch (error) {
          set(state => ({
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                error: error instanceof Error ? error.message : 'Failed to load messages',
                isLoadingMessages: false,
              },
            },
          }));
        }
      },

      // Load more messages (pagination)
      loadMoreMessages: async (chatId: string) => {
        const chatState = get().chats[chatId];
        if (!chatState || !chatState.hasMoreMessages || chatState.isLoadingMessages) {
          return;
        }

        set(state => ({
          chats: {
            ...state.chats,
            [chatId]: {
              ...state.chats[chatId],
              isLoadingMessages: true,
            },
          },
        }));

        try {
          const response = await MessagesService.getChatMessages(chatId, {
            skip: chatState.currentPage * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
          });

          set(state => ({
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                messages: [...response.data.reverse(), ...state.chats[chatId].messages],
                hasMoreMessages: response.data.length === ITEMS_PER_PAGE,
                isLoadingMessages: false,
                currentPage: state.chats[chatId].currentPage + 1,
              },
            },
          }));
        } catch (error) {
          set(state => ({
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                error:
                  error instanceof Error ? error.message : 'Failed to load more messages',
                isLoadingMessages: false,
              },
            },
          }));
        }
      },

      // Send message with streaming response
      sendMessage: async (chatId: string, content: string, model = DEFAULT_MODEL) => {
        const chatState = get().chats[chatId];
        if (!chatState) {
          get().initChat(chatId);
        }

        const userMessageId = uuid();
        const aiMessageId = uuid();

        // Create user message
        const userMessage = {
          id: userMessageId,
          content,
          role: 'user' as const,
          created_at: new Date().toISOString(),
          llm_model: model,
          nested_chats: [],
          reply_content: null,
          attachments: [],
        };

        // Create empty AI message for streaming
        const aiMessage = {
          id: aiMessageId,
          content: '',
          role: 'model' as const,
          created_at: new Date().toISOString(),
          llm_model: model,
          nested_chats: [],
          reply_content: null,
          attachments: [],
        };

        // Add both messages immediately
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
              isStreaming: true,
              streamingMessageId: aiMessageId,
              error: null,
            },
          },
        }));

        // Create abort controller for this request
        const abortController = new AbortController();
        set(state => ({
          chats: {
            ...state.chats,
            [chatId]: {
              ...state.chats[chatId],
              abortController,
            },
          },
        }));

        try {
          const requestData: ConversationWithAIRequestDto = {
            chat_id: chatId,
            content,
            model,
            message_id: userMessageId,
            future_llm_message_id: aiMessageId,
          };

          let accumulatedContent = '';
          let titleUpdated = false;

          await ConversationsService.conversationWithAI(
            requestData,
            (chunk: ConversationWithAIResponseDto) => {
              // Handle different chunk types
              switch (chunk.type) {
                case 'content':
                  if (chunk.body) {
                    accumulatedContent += chunk.body;
                    // Update the streaming message
                    set(state => ({
                      chats: {
                        ...state.chats,
                        [chatId]: {
                          ...state.chats[chatId],
                          messages: state.chats[chatId].messages.map(msg =>
                            msg.id === aiMessageId
                              ? { ...msg, content: accumulatedContent }
                              : msg
                          ),
                        },
                      },
                    }));
                  }
                  break;

                case 'title': {
                  if ('title' in chunk && 'chat_id' in chunk && !titleUpdated) {
                    titleUpdated = true;
                    const titleChunk = chunk as { title: string; chat_id: string };
                    set(state => ({
                      chats: {
                        ...state.chats,
                        [chatId]: {
                          ...state.chats[chatId],
                          chat: state.chats[chatId].chat
                            ? { ...state.chats[chatId].chat, name: titleChunk.title }
                            : state.chats[chatId].chat,
                        },
                      },
                    }));
                    // Update document title
                    document.title = titleChunk.title;
                  }
                  break;
                }

                case 'complete':
                  // Finalize the message
                  set(state => ({
                    chats: {
                      ...state.chats,
                      [chatId]: {
                        ...state.chats[chatId],
                        messages: state.chats[chatId].messages.map(msg =>
                          msg.id === aiMessageId
                            ? { ...msg, content: accumulatedContent }
                            : msg
                        ),
                        isStreaming: false,
                        streamingMessageId: null,
                        abortController: null,
                      },
                    },
                  }));
                  break;

                case 'error': {
                  let errorMessage = 'An error occurred';
                  if ('error' in chunk) {
                    try {
                      const errorData = JSON.parse(chunk.error as string);
                      errorMessage = errorData?.error?.message || errorMessage;
                    } catch {
                      errorMessage = (chunk.error as string) || errorMessage;
                    }
                  }

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
                        messages: state.chats[chatId].messages.filter(
                          msg => msg.id !== aiMessageId
                        ),
                      },
                    },
                  }));
                  break;
                }
              }
            },
            abortController.signal
          );
        } catch (error) {
          // Handle network errors or aborted requests
          if (error instanceof Error && error.name !== 'AbortError') {
            set(state => ({
              chats: {
                ...state.chats,
                [chatId]: {
                  ...state.chats[chatId],
                  error: error.message,
                  isStreaming: false,
                  streamingMessageId: null,
                  abortController: null,
                  // Remove the empty AI message on error
                  messages: state.chats[chatId].messages.filter(
                    msg => msg.id !== aiMessageId
                  ),
                },
              },
            }));
          }
        }
      },

      // Stop streaming
      stopStreaming: (chatId: string) => {
        const chatState = get().chats[chatId];
        if (chatState?.abortController) {
          chatState.abortController.abort();
          set(state => ({
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                isStreaming: false,
                streamingMessageId: null,
                abortController: null,
              },
            },
          }));
        }
      },

      appendNewNestedChat: ({
        newChatId,
        parentChatId,
        parentMessageId,
        connectionType,
      }) => {
        // Get parent message to count existing branches
        const parentMessage = get().chats[parentChatId]?.messages.find(
          msg => msg.id === parentMessageId
        );

        const existingBranchesCount = parentMessage?.nested_chats?.length || 0;
        const branchColor = BRANCH_COLORS[existingBranchesCount % BRANCH_COLORS.length];

        // Create branch object for optimistic update
        const newBranchContext = {
          id: uuid(),
          child_chat_id: newChatId,
          connection_type: connectionType,
          connection_color: branchColor,
          context_type: 'full_message' as const,
          start_position: 0,
          end_position: 0,
        };

        set(state => ({
          chats: {
            ...state.chats,
            [parentChatId]: {
              ...state.chats[parentChatId],
              messages: state.chats[parentChatId].messages.map(msg =>
                msg.id === parentMessageId
                  ? {
                      ...msg,
                      nested_chats: [...(msg.nested_chats || []), newBranchContext],
                    }
                  : msg
              ),
            },
          },
        }));

        const rollbackFunc = () => {
          set(state => ({
            chats: {
              ...state.chats,
              [parentChatId]: {
                ...state.chats[parentChatId],
                messages: state.chats[parentChatId].messages.map(msg =>
                  msg.id === parentMessageId
                    ? {
                        ...msg,
                        nested_chats: [
                          ...(msg.nested_chats || []).filter(
                            item => item.id !== newBranchContext.id
                          ),
                        ],
                      }
                    : msg
                ),
              },
            },
          }));
        };

        // return rollback function
        return [newBranchContext, rollbackFunc];
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
            activeChatIds: state.activeChatIds.filter(id => id !== chatId),
          };
        });
      },

      // Set error
      setError: (chatId: string, error: string | null) => {
        set(state => ({
          chats: {
            ...state.chats,
            [chatId]: {
              ...state.chats[chatId],
              error,
            },
          },
        }));
      },

      // Add chat to active list
      addChatToActive: (chatId: string) => {
        set(state => ({
          activeChatIds: state.activeChatIds.includes(chatId)
            ? state.activeChatIds
            : [...state.activeChatIds, chatId],
        }));
      },

      // Remove chat from active list
      removeChatFromActive: (chatId: string) => {
        set(state => ({
          activeChatIds: state.activeChatIds.filter(id => id !== chatId),
        }));
      },
    }),
    {
      name: 'chats-store',
    }
  )
);
