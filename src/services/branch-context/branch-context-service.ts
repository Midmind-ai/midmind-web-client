import { baseAxiosInstance } from '@config/axios';

import type { GetBranchContextResponseDto } from '@services/branch-context/branch-context-dtos';

export class BranchContextService {
  static async getBranchContext(messageId: string) {
    const { data } = await baseAxiosInstance.get<GetBranchContextResponseDto>(
      `/messages/${messageId}/branch-context`
    );

    return data;
  }
}
