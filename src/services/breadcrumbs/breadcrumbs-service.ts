import { baseAxiosInstance } from '@config/axios';

import type { GetChatBreadcrumbsResponseDto } from '@services/breadcrumbs/breadcrumbs-dtos';

export class BreadcrumbsService {
  static async getChatBreadcrumbs(chatId: string) {
    const { data } = await baseAxiosInstance.get<GetChatBreadcrumbsResponseDto>(
      `/chats/${chatId}/breadcrumbs`
    );

    return data;
  }
}
