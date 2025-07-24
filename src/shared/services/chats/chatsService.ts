import { baseAxiosInstance } from '@shared/config/axios';

import { type Chat } from '@shared/types/entities';

import type { UpdateChatDetailsRequest } from '@/shared/services/chats/types';
import type { MessageResponse } from '@/shared/types/common';

export class ChatsService {
  static async getChats() {
    const { data } = await baseAxiosInstance.get<Chat[]>('/chats');

    return data;
  }

  static async createChat() {
    const { data } = await baseAxiosInstance.post<Chat>('/chats');

    return data;
  }

  static async getChatDetails(id: string) {
    const { data } = await baseAxiosInstance.get<Chat>(`/chats/${id}`);

    return data;
  }

  static async updateChatDetails(id: string, body: UpdateChatDetailsRequest) {
    const { data } = await baseAxiosInstance.put<MessageResponse>(`/chats/${id}`, body);

    return data;
  }

  static async deleteChat(id: string) {
    const { data } = await baseAxiosInstance.delete<MessageResponse>(`/chats/${id}`);

    return data;
  }
}
