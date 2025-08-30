import { baseAxiosInstance } from '@config/axios';

import type {
  InitFileUploadRequestDto,
  InitFileUploadResponseDto,
  FinalizeFileUploadRequestDto,
  GetFileResponseDto,
} from '@services/files/files-dtos';

import type { MessageResponse } from '@shared-types/common';

import type { AxiosProgressEvent } from 'axios';

export class FilesService {
  static async initFileUpload(
    body: InitFileUploadRequestDto,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => void
  ) {
    const { data } = await baseAxiosInstance.post<InitFileUploadResponseDto>(
      '/files',
      body,
      {
        onUploadProgress,
      }
    );

    return data;
  }

  static async finalizeFileUpload(fileId: string, body: FinalizeFileUploadRequestDto) {
    const { data } = await baseAxiosInstance.put<MessageResponse>(
      `/files/${fileId}`,
      body
    );

    return data;
  }

  static async getFile(fileId: string) {
    const { data } = await baseAxiosInstance.get<GetFileResponseDto>(`/files/${fileId}`);

    return data;
  }
}
