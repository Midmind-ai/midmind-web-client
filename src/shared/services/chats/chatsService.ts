import { baseAxiosInstance } from '@shared/config/axios';

import type { Chat, ChatMessage } from '@shared/types/entities';

import type {
  SendMessageToChatRequest,
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
    body: SendMessageToChatRequest
  ): Promise<
    ReadableStream<{ data: { content: string; type: 'content' | 'error' | 'completed' } }>
  > {
    return new ReadableStream({
      async start(controller) {
        try {
          if (!chatId || !body.content) {
            controller.enqueue({
              data: {
                content: 'Invalid chatId or message',
                type: 'error',
              },
            });
            controller.close();

            return;
          }

          controller.enqueue({
            data: {
              content: 'Начинаю обработку сообщения...',
              type: 'content',
            },
          });

          const response = await baseAxiosInstance.post(`/chats/${chatId}/messages`, body, {
            responseType: 'stream',
          });

          const reader = response.data.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            const chunkText = decoder.decode(value, { stream: true });

            for (const line of chunkText.split('\n')) {
              if (!line.trim()) {
                continue;
              }

              try {
                const parsed = JSON.parse(line);
                controller.enqueue({ data: parsed });
              } catch (error) {
                console.error('Error parsing chunk:', error);
                controller.enqueue({
                  data: {
                    content: line,
                    type: 'content',
                  },
                });
              }
            }
          }

          controller.enqueue({
            data: {
              content: 'Сообщение успешно отправлено',
              type: 'completed',
            },
          });
        } catch (error) {
          controller.enqueue({
            data: {
              content: error instanceof Error ? error.message : 'Произошла неизвестная ошибка',
              type: 'error',
            },
          });
        } finally {
          controller.close();
        }
      },
    });
  }
}
