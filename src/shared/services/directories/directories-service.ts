import { baseAxiosInstance } from '@shared/config/axios';

import type { components } from 'generated/api-types';

export type Directory = components['schemas']['GetDirectoryDto'];

export class DirectoriesService {
  static async getDirectories(parentId?: string) {
    const params = parentId ? { parent_id: parentId } : {};

    const { data } = await baseAxiosInstance.get<Directory[]>('/directories', {
      params,
    });

    return data;
  }
}
