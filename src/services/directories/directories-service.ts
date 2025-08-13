import { baseAxiosInstance } from '@/config/axios';

import type { components } from 'generated/api-types';

export type Directory = components['schemas']['GetDirectoryDto'];
export type CreateDirectoryDto = components['schemas']['CreateDirectoryDto'];
export type UpdateDirectoryDto = components['schemas']['UpdateDirectoryDto'];
export type MessageDto = components['schemas']['MessageDto'];

export class DirectoriesService {
  static async getDirectories(parentId?: string) {
    const params = parentId ? { parent_id: parentId } : {};

    const { data } = await baseAxiosInstance.get<Directory[]>('/directories', {
      params,
    });

    return data;
  }

  static async createDirectory(body: CreateDirectoryDto) {
    const { data } = await baseAxiosInstance.post<MessageDto>('/directories', body);

    return data;
  }

  static async updateDirectory(id: string, body: UpdateDirectoryDto) {
    const { data } = await baseAxiosInstance.put<MessageDto>(`/directories/${id}`, body);

    return data;
  }

  static async deleteDirectory(id: string) {
    const { data } = await baseAxiosInstance.delete<MessageDto>(`/directories/${id}`);

    return data;
  }
}
