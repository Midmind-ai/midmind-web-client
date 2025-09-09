import { baseAxiosInstance } from '@config/axios';
import type { GetChatBreadcrumbsResponse } from '@services/breadcrumbs/breadcrumbs-dtos';

export class BreadcrumbsService {
  static async getChatBreadcrumbs(chatId: string) {
    const { data } = await baseAxiosInstance.get<GetChatBreadcrumbsResponse>(
      `/chats/${chatId}/breadcrumbs`
    );

    return data;
  }
}
