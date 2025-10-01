import { baseAxiosInstance } from '@config/axios';
import type {
  UpdateChatMetadataRequestDto,
  GetChatMetadataByMessageIdResponse,
} from '@services/chat-metadata/chat-metadata-dtos';
import type { MessageResponse } from '@shared-types/common';

export class ChatMetadataService {
  static async updateChatMetadata(chatId: string, body: UpdateChatMetadataRequestDto) {
    const { data } = await baseAxiosInstance.put<MessageResponse>(
      `/chats/${chatId}/chat-metadata`,
      body
    );

    return data;
  }

  static async getChatMetadataByMessageId(messageId: string) {
    const { data } = await baseAxiosInstance.get<GetChatMetadataByMessageIdResponse>(
      `/messages/${messageId}/chat-metadata`
    );

    return data;
  }
}
