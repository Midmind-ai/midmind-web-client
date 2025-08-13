import { baseAxiosInstance } from '@config/axios';

import type { GetChatMessagesParamsDto } from '@services/messages/messages-dtos';

import type { PaginatedResponse } from '@shared-types/common';
import type { ChatMessage } from '@shared-types/entities';

export class MessagesService {
  static async getChatMessages(chatId: string, params: GetChatMessagesParamsDto) {
    const { data } = await baseAxiosInstance.get<PaginatedResponse<ChatMessage[]>>(
      `/chats/${chatId}/messages`,
      { params }
    );

    return data;
  }
}
