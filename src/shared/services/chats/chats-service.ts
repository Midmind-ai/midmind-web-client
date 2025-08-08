import { baseAxiosInstance } from '@shared/config/axios';

import type { UpdateChatDetailsRequestDto } from '@shared/services/chats/chats-dtos';

import type { MessageResponse } from '@shared/types/common';
import type { Chat } from '@shared/types/entities';

export class ChatsService {
  static async getChats() {
    const { data } = await baseAxiosInstance.get<Chat[]>('/chats');

    return data;
  }

  static async getChatDetails(chatId: string) {
    const { data } = await baseAxiosInstance.get<Chat>(`/chats/${chatId}`);

    return data;
  }

  static async updateChatDetails(chatId: string, body: UpdateChatDetailsRequestDto) {
    const { data } = await baseAxiosInstance.put<MessageResponse>(`/chats/${chatId}`, body);

    return data;
  }

  static async deleteChat(chatId: string) {
    const { data } = await baseAxiosInstance.delete<MessageResponse>(`/chats/${chatId}`);

    return data;
  }
}
