import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { components } from '../../../../generated/api-types';
import { ChatMetadataService } from '../../../services/chat-metadata/chat-metadata-service';
import { useEntityCreationStateStore } from '../../../stores/entity-creation-state.store';
import { getRandomColor } from '../../../utils/color-picker';
import { scrollToBottom } from '../utils/scroll-utils';
import { AI_MODELS } from '@constants/ai-models';
import { ChatsService } from '@services/chats/chats-service';
import type { GetFileResponseDto } from '@services/files/files-dtos';
import { FilesService } from '@services/files/files-service';
import type {
  AIModel,
  ChatMessage,
  Chat,
  ChatBranchContext,
} from '@shared-types/entities';

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

export interface ChatsStoreState {
  // Multiple chats support
  chats: Record<string, ChatState>;
  isCreatingNewChat: boolean;

  // Actions
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
  appendNewNestedChat: (args: {
    newChatId: string;
    parentChatId: string;
    parentMessageId: string;
    connectionType: 'attached' | 'detached' | 'temporary';
    contextType?: 'full_message' | 'text_selection';
    selectedText?: string;
    startPosition?: number;
    endPosition?: number;
  }) => [ChatBranchContext, VoidFunction];
  changeNestedChatConnectionType: (
    parentChatId: string,
    parentChatMessageId: string,
    chatId: string,
    connectionType: 'attached' | 'detached' | 'temporary'
  ) => Promise<void>;
  clearChat: (chatId: string) => void;
  setError: (chatId: string, error: string | null) => void;
  addAttachments: (
    chatId: string,
    attachments: { id: string; file_name: string; download_url: string }[]
  ) => void;
}

export const useChatsStore = create<ChatsStoreState>()(
  devtools(
    (set, get) => ({
      // Initial state
      chats: {},
      isCreatingNewChat: false,

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
          // const chatDetails = await ChatsService.getChatDetails(chatId);
          set(state => ({
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                // chat: chatDetails,
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
          const response = await ChatsService.getMessages(chatId, {
            offset: 0,
            limit: ITEMS_PER_PAGE,
          });

          // Add default values for fields that backend doesn't populate yet
          const messages = response.messages.map(msg => ({
            ...msg,
            reply_content: null,
            nested_chats: [],
            attachments: [],
          }));

          const attachments = await get().loadAttachments(messages);

          set(state => ({
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                messages: messages.reverse(),
                hasMoreMessages: messages.length === ITEMS_PER_PAGE,
                isLoadingMessages: false,
                currentPage: 1,
                attachments,
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

      // Load draft message
      loadDraftMessage: async (chatId: string) => {
        get().initChat(chatId);

        try {
          const draftMessage = await ChatsService.getDraftMessage(chatId);

          // Add default values for fields that backend doesn't populate yet
          const enrichedDraft: ChatMessage = {
            ...draftMessage,
            nested_chats: [],
            attachments: draftMessage.attachments || [],
          };

          // Extract reply context from draft if exists
          const replyContext =
            draftMessage.reply_to_message_id && draftMessage.reply_content
              ? {
                  id: draftMessage.reply_to_message_id,
                  content: draftMessage.reply_content,
                }
              : null;

          set(state => ({
            chats: {
              ...state.chats,
              [chatId]: {
                ...state.chats[chatId],
                draftMessage: enrichedDraft,
                replyContext,
              },
            },
          }));

          // If draft has content and attachments, load the attachment files
          if (
            draftMessage.content &&
            draftMessage.content.trim() !== '' &&
            enrichedDraft.attachments.length > 0
          ) {
            const draftAttachments = await get().loadAttachments([enrichedDraft]);

            // Replace attachments in store with draft attachments
            set(state => ({
              chats: {
                ...state.chats,
                [chatId]: {
                  ...state.chats[chatId],
                  attachments: draftAttachments,
                },
              },
            }));
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
          const response = await ChatsService.getMessages(chatId, {
            offset: chatState.currentPage * ITEMS_PER_PAGE,
            limit: ITEMS_PER_PAGE,
          });

          // Add default values for fields that backend doesn't populate yet
          const messages = response.messages.map(msg => ({
            ...msg,
            reply_content: null,
            nested_chats: [],
            attachments: [],
          }));

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

      sendMessage: async (
        chatId: string,
        content: string,
        model = DEFAULT_MODEL,
        attachments = [],
        attachmentFiles = []
      ) => {
        const chatState = get().chats[chatId];
        if (!chatState) {
          get().initChat(chatId);
        }

        const userMessageId = uuid();
        const aiMessageId = uuid();

        // Get the current reply context
        const replyContext = get().chats[chatId]?.replyContext;

        // Create user message
        const userMessage: ChatMessage = {
          id: userMessageId,
          chat_id: chatId,
          user_id: null,
          content,
          role: 'user',
          created_at: new Date().toISOString(),
          llm_model: model as ChatMessage['llm_model'],
          is_draft: false,
          nested_chats: [],
          reply_content: replyContext?.content || null,
          attachments: attachments,
        };

        // Create empty AI message for streaming
        const aiMessage: ChatMessage = {
          id: aiMessageId,
          chat_id: chatId,
          user_id: null,
          content: '',
          role: 'model',
          created_at: new Date().toISOString(),
          llm_model: model as ChatMessage['llm_model'],
          is_draft: false,
          nested_chats: [],
          reply_content: null,
          attachments: [],
        };

        const localAttachments = attachmentFiles.map((file, index) => ({
          id: attachments[index]?.id || uuid(),
          file_name: file.name,
          download_url: URL.createObjectURL(file),
        }));

        // Add both messages immediately and clear reply context
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
              replyContext: null, // Clear reply context after sending
            },
          },
        }));

        // Scroll to bottom after sending message
        scrollToBottom();

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
          const requestData = {
            id: userMessageId,
            content,
            model,
            ...(replyContext && { reply_to: replyContext }),
            ...(attachments.length > 0 && {
              attachments: attachments.map(att => att.id),
            }),
          };

          let accumulatedContent = '';
          let titleUpdated = false;

          await ChatsService.sendMessage(
            chatId,
            requestData,
            chunk => {
              // Handle different chunk types
              switch (chunk.type) {
                case 'content':
                  if (chunk.content) {
                    accumulatedContent += chunk.content;
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
                  if (chunk.content && !titleUpdated) {
                    titleUpdated = true;
                    const title = chunk.content;
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
                  const errorMessage = chunk.content || 'An error occurred';

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
        contextType = 'full_message',
        selectedText,
        startPosition = 0,
        endPosition = 0,
      }) => {
        const branchColor = getRandomColor();

        // Create branch object for optimistic update
        const newBranchContext = {
          id: uuid(),
          child_chat_id: newChatId,
          connection_type: connectionType,
          connection_color: branchColor,
          context_type: contextType,
          selected_text: selectedText,
          start_position: startPosition,
          end_position: endPosition,
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

      changeNestedChatConnectionType: async (
        parentChatId: string,
        parentChatMessageId: string,
        chatId: string,
        connectionType: 'attached' | 'detached' | 'temporary'
      ) => {
        const prevParentChatState = get().chats[parentChatId];
        // debugger;
        set(state => ({
          ...state,
          chats: {
            ...state.chats,
            [parentChatId]: {
              ...state.chats[parentChatId],
              messages: state.chats[parentChatId].messages.map(message => {
                if (message.id === parentChatMessageId) {
                  return {
                    ...message,
                    nested_chats: message.nested_chats.map(nested_chat => {
                      if (nested_chat.child_chat_id === chatId) {
                        return {
                          ...nested_chat,
                          connection_type: connectionType,
                        };
                      } else {
                        return nested_chat;
                      }
                    }),
                  };
                }

                return message;
              }),
            },
          },
        }));
        try {
          await ChatMetadataService.updateChatMetadata(chatId, {
            connection_type: connectionType,
          });
        } catch (e) {
          set(state => ({
            ...state,
            chats: {
              ...state.chats,
              [parentChatId]: prevParentChatState,
            },
          }));
          throw e;
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
        set(state => ({
          chats: {
            ...state.chats,
            [chatId]: {
              ...state.chats[chatId],
              replyContext,
            },
          },
        }));
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
              attachments: [...(state.chats[chatId]?.attachments || []), ...attachments],
            },
          },
        }));
      },
    }),
    {
      name: 'chats-store',
    }
  )
);
