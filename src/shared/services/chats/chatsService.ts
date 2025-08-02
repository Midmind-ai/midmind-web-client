import { baseAxiosInstance } from '@shared/config/axios';

import type { Chat, ChatMessage } from '@shared/types/entities';

import type {
  ConversationWithAIRequest,
  ConversationWithAIResponse,
  UpdateChatDetailsRequest,
  GetChatMessagesParams,
} from '@/shared/services/chats/types';
import type { MessageResponse, PaginatedResponse } from '@/shared/types/common';

export class ChatsService {
  static async getChats() {
    const { data } = await baseAxiosInstance.get<Chat[]>('/chats');

    return data;
  }

  static async getChatDetails(chatId: string) {
    const { data } = await baseAxiosInstance.get<Chat>(`/chats/${chatId}`);

    return data;
  }

  static async updateChatDetails(chatId: string, body: UpdateChatDetailsRequest) {
    const { data } = await baseAxiosInstance.put<MessageResponse>(`/chats/${chatId}`, body);

    return data;
  }

  static async deleteChat(chatId: string) {
    const { data } = await baseAxiosInstance.delete<MessageResponse>(`/chats/${chatId}`);

    return data;
  }

  static async conversationWithAI(
    body: ConversationWithAIRequest,
    onChunk: (data: ConversationWithAIResponse) => void,
    signal?: AbortSignal
  ) {
    let lastProcessedLength = 0;

    await baseAxiosInstance.post<ConversationWithAIResponse>(`/conversations`, body, {
      responseType: 'text',
      signal,
      onDownloadProgress: progressEvent => {
        const responseText = progressEvent.event.target.response;

        const newData = responseText.slice(lastProcessedLength);
        lastProcessedLength = responseText.length;

        const lines = newData.split('\n').filter((line: string) => line.trim());

        for (const line of lines) {
          const trimmed = line.trim();

          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.replace(/^data:\s*/, '');

            const parsed = JSON.parse(jsonStr);

            onChunk(parsed);
          }
        }
      },
    });
  }

  static async getChatMessages(chatId: string, params: GetChatMessagesParams) {
    const { data } = await baseAxiosInstance.get<PaginatedResponse<ChatMessage[]>>(
      `/chats/${chatId}/messages`,
      { params }
    );

    return data;
  }
}
