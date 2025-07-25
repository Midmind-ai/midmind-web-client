import { baseAxiosInstance } from '@shared/config/axios';

import type { Chat, ChatMessage } from '@shared/types/entities';

import type {
  SendMessageToChatRequest,
  SendMessageToChatResponse,
  UpdateChatDetailsRequest,
} from '@/shared/services/chats/types';
import type { MessageResponse, PaginatedResponse } from '@/shared/types/common';

export class ChatsService {
  static async getChats() {
    const { data } = await baseAxiosInstance.get<Chat[]>('/chats');

    return data;
  }

  static async createChat() {
    const { data } = await baseAxiosInstance.post<Chat>('/chats');

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

  static async getChatMessages(chatId: string) {
    const { data } = await baseAxiosInstance.get<PaginatedResponse<ChatMessage[]>>(
      `/chats/${chatId}/messages`
    );

    return data;
  }

  static async sendMessageToChat(
    chatId: string,
    body: SendMessageToChatRequest,
    onChunk: (data: SendMessageToChatResponse) => void
  ) {
    try {
      let lastProcessedLength = 0;

      await baseAxiosInstance.post<SendMessageToChatResponse>(`/chats/${chatId}/messages`, body, {
        responseType: 'text',
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
    } catch (error) {
      console.error(error);
    }
  }
}
