import { baseAxiosInstance } from '@config/axios';
import type { SendMessageRequest, MessageListResponse } from '@services/chats/chats-dtos';

export class ChatsService {
  static async sendMessage(
    chatId: string,
    request: SendMessageRequest,
    onChunk: (data: {
      type: string;
      body?: string;
      title?: string;
      chat_id?: string;
      error?: string;
      id?: string;
    }) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const token = localStorage.getItem('accessToken');
    const url = `${baseAxiosInstance.defaults.baseURL}/chats/${chatId}/send-message`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.replace(/^data:\s*/, '');

          try {
            const parsed = JSON.parse(jsonStr);
            onChunk(parsed);
          } catch (error) {
            console.error('Failed to parse SSE data:', jsonStr, error);
          }
        }
      }
    }
  }

  static async getMessages(
    chatId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<MessageListResponse> {
    const { data } = await baseAxiosInstance.get<MessageListResponse>(
      `/chats/${chatId}/messages`,
      { params }
    );

    return data;
  }
}
