import { useSWRConfig } from 'swr';
import { v4 as uuidv4 } from 'uuid';

import { SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@shared/services/chats/chatsService';

import type { Chat, ChatMessage } from '@shared/types/entities';

import { ITEMS_PER_PAGE } from '@/features/Chat/hooks/useGetChatMessages';
import type { LLModel } from '@/features/Chat/types/chatTypes';
import { handleLLMResponse } from '@/features/Chat/utils/swr';
import type {
  ConversationWithAIRequest,
  ConversationWithAIResponse,
} from '@/shared/services/chats/types';
import { useAbortControllerStore } from '@/shared/stores/useAbortControllerStore';

type CreateChatArgs = {
  content: string;
  model: LLModel;
  abortController: AbortController;
  threadContext?: ConversationWithAIRequest['thread_context'];
  sendMessage?: boolean;
};

export const useCreateChat = () => {
  const { mutate } = useSWRConfig();

  const clearAbortController = useAbortControllerStore(state => state.clearAbortController);

  const createChat = async ({
    content,
    model,
    threadContext,
    sendMessage = false,
    abortController,
  }: CreateChatArgs) => {
    const chatId = uuidv4();
    const messageId = uuidv4();

    const newChat: Chat = {
      id: chatId,
      name: 'New chat',
      created_at: new Date().toISOString(),
      updated_at: null,
      thread_level: threadContext?.thread_level || 0, // will be removed in the future
    };

    await mutate(
      SWRCacheKeys.GetChats,
      (existingChats?: Chat[]) => {
        if (!existingChats) {
          return [newChat];
        }

        return [...existingChats, newChat];
      },
      { revalidate: false }
    );

    if (sendMessage) {
      const userMessage: ChatMessage = {
        id: messageId,
        content: content,
        role: 'user',
        threads: [],
        llm_model: model,
      };

      const messagesKey = `${SWRCacheKeys.GetMessages(chatId)}?page=0&skip=0&take=${ITEMS_PER_PAGE}`;

      await mutate(
        messagesKey,
        {
          data: [userMessage],
          meta: {
            total: 1,
            lastPage: 1,
            currentPage: 1,
            perPage: 20,
            prev: null,
            next: null,
          },
        },
        {
          revalidate: false,
          populateCache: true,
        }
      );

      const conversationBody: ConversationWithAIRequest = {
        chat_id: chatId,
        message_id: messageId,
        content,
        model,
        ...(threadContext && { thread_context: threadContext }),
      };

      ChatsService.conversationWithAI(
        conversationBody,
        (chunk: ConversationWithAIResponse) => {
          handleLLMResponse(mutate, clearAbortController, chatId, model, chunk);
        },
        abortController.signal
      );
    }

    return chatId;
  };

  return {
    createChat,
  };
};
