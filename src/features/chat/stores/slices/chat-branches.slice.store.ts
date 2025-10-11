import { v4 as uuid } from 'uuid';
import type { StateCreator } from 'zustand';
import { ChatMetadataService } from '../../../../services/chat-metadata/chat-metadata-service';
import { getRandomColor } from '../../../../utils/color-picker';
import type { ChatsStoreState } from '../chats.store';
import type { ChatBranchContext } from '@shared-types/entities';

/**
 * Chat Branches Slice
 * Handles all nested chat/branching functionality including:
 * - Creating new branches from messages
 * - Managing branch connection types (attached/detached/temporary)
 * - Optimistic updates with rollback support
 */

export interface ChatBranchesSlice {
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
}

export const createChatBranchesSlice: StateCreator<
  ChatsStoreState,
  [],
  [],
  ChatBranchesSlice
> = (set, get) => ({
  /**
   * Append a new nested chat (branch) to a message
   * Returns branch context and rollback function for error handling
   */
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
    const newBranchContext: ChatBranchContext = {
      id: uuid(),
      child_chat_id: newChatId,
      connection_type: connectionType,
      connection_color: branchColor,
      context_type: contextType,
      selected_text: selectedText,
      start_position: startPosition,
      end_position: endPosition,
    };

    // Optimistically add branch to message
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

    // Rollback function to remove branch if needed
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

    return [newBranchContext, rollbackFunc];
  },

  /**
   * Change the connection type of a nested chat (branch)
   * Updates optimistically with rollback on error
   */
  changeNestedChatConnectionType: async (
    parentChatId: string,
    parentChatMessageId: string,
    chatId: string,
    connectionType: 'attached' | 'detached' | 'temporary'
  ) => {
    const prevParentChatState = get().chats[parentChatId];

    // Optimistic update
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
                  }

                  return nested_chat;
                }),
              };
            }

            return message;
          }),
        },
      },
    }));

    try {
      // Persist to backend
      await ChatMetadataService.updateChatMetadata(chatId, {
        connection_type: connectionType,
      });
    } catch (e) {
      // Rollback on error
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
});
