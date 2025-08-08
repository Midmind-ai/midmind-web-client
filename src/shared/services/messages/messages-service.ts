import type { ChatMessage } from '@shared/types/entities';

import { baseAxiosInstance } from '@/shared/config/axios';
import type { GetChatMessagesParamsDto } from '@/shared/services/messages/messages-dtos';
import type { PaginatedResponse } from '@/shared/types/common';

export class MessagesService {
  static async getChatMessages(chatId: string, params: GetChatMessagesParamsDto) {
    const { data } = await baseAxiosInstance.get<PaginatedResponse<ChatMessage[]>>(
      `/chats/${chatId}/messages`,
      { params }
    );

    return data;
  }
}
