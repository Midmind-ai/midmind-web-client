import { useSWRConfig } from 'swr';
import { v4 as uuidv4 } from 'uuid';

import { LLModels, SWRCacheKeys } from '@shared/constants/api';

import { ChatsService } from '@shared/services/chats/chatsService';

import type { Chat, ChatMessage } from '@shared/types/entities';

import { ITEMS_PER_PAGE } from '@/features/Chat/hooks/useGetChatMessages';
import { handleLLMResponse } from '@/features/Chat/utils/swr';
import type {
  ConversationWithAIRequest,
  ConversationWithAIResponse,
} from '@/shared/services/chats/types';

export const useCreateChat = () => {
  const { mutate } = useSWRConfig();

  const createChat = async (content: string, model = LLModels.Gemini20Flash) => {
    const chatId = uuidv4();
    const messageId = uuidv4();

    const newChat: Chat = {
      id: chatId,
      name: 'New chat',
      created_at: new Date().toISOString(),
      updated_at: null,
      thread_level: 0,
    };

    await mutate(
      SWRCacheKeys.GetChats,
      (existingChats?: Chat[]) => {
        if (!existingChats) {
          return [newChat];
        }

        return [newChat, ...existingChats];
      },
      { revalidate: false }
    );

    const userMessage: ChatMessage = {
      id: messageId,
      content: content,
      role: 'user',
      threads: [],
      llm_model: null,
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
    };

    ChatsService.conversationWithAI(conversationBody, (chunk: ConversationWithAIResponse) => {
      handleLLMResponse(mutate, chatId, chunk);
    });

    return chatId;
  };

  return {
    createChat,
  };
};
