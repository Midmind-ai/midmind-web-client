import { baseAxiosInstance } from '@/shared/config/axios';
import type { GetThreadContextResponse } from '@/shared/services/thread-context/thread-context-dtos';

export class ThreadContextService {
  static async getThreadContext(messageId: string) {
    const { data } = await baseAxiosInstance.get<GetThreadContextResponse>(
      `/messages/${messageId}/thread-context`
    );

    return data;
  }
}
