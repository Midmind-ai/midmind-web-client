import { baseAxiosInstance } from '@config/axios';

import type {
  UpdateChatDetailsRequestDto,
  CreateNewChatRequestDto,
} from '@services/chats/chats-dtos';

import type { MessageResponse } from '@shared-types/common';
import type { Chat } from '@shared-types/entities';

export class ChatsService {
  static async getChats(options?: { parentDirectoryId?: string; parentChatId?: string }) {
    const params: Record<string, string> = {};

    if (options?.parentDirectoryId && options.parentDirectoryId !== 'root') {
      params.parent_folder_id = options.parentDirectoryId;
    }

    if (options?.parentChatId && options.parentChatId !== 'root') {
      params.parent_chat_id = options.parentChatId;
    }

    const { data } = await baseAxiosInstance.get<Chat[]>('/chats', {
      params,
    });

    return data;
  }

  static async createNewChat(body: CreateNewChatRequestDto) {
    const { data } = await baseAxiosInstance.post<MessageResponse>('/chats', body);

    return data;
  }

  static async getChatDetails(chatId: string) {
    const { data } = await baseAxiosInstance.get<Chat>(`/chats/${chatId}`);

    return data;
  }

  static async updateChatDetails(chatId: string, body: UpdateChatDetailsRequestDto) {
    const { data } = await baseAxiosInstance.put<MessageResponse>(
      `/chats/${chatId}`,
      body
    );

    return data;
  }

  static async deleteChat(chatId: string) {
    const { data } = await baseAxiosInstance.delete<MessageResponse>(`/chats/${chatId}`);

    return data;
  }
}
