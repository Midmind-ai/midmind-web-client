import { baseAxiosInstance } from '@/shared/config/axios';
import type { GetThreadContextDto } from '@/shared/services/thread-contexts/thread-contexts.dto';

export class ThreadContextsService {
  static async getThreadContext(messageId: string) {
    const { data } = await baseAxiosInstance.get<GetThreadContextDto>(
      `/messages/${messageId}/thread-context`
    );

    return data;
  }
}
