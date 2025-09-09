import { baseAxiosInstance } from '@config/axios';
import type {
  CreateDirectoryDto,
  Directory,
  UpdateDirectoryDto,
  MoveDirectoryDto,
} from '@services/directories/directories-dtos';

export class DirectoriesService {
  static async getDirectories(parentId?: string) {
    const params = parentId && parentId !== 'root' ? { parent_id: parentId } : {};

    const { data } = await baseAxiosInstance.get<Directory[]>('/folders', {
      params,
    });

    return data;
  }

  static async createDirectory(body: CreateDirectoryDto) {
    const { data } = await baseAxiosInstance.post<CreateDirectoryDto>('/folders', body);

    return data;
  }

  static async updateDirectory(id: string, body: UpdateDirectoryDto) {
    const { data } = await baseAxiosInstance.put<UpdateDirectoryDto>(
      `/folders/${id}`,
      body
    );

    return data;
  }

  static async deleteDirectory(id: string) {
    const { data } = await baseAxiosInstance.delete<UpdateDirectoryDto>(`/folders/${id}`);

    return data;
  }

  static async moveDirectory(id: string, body: MoveDirectoryDto) {
    const { data } = await baseAxiosInstance.put<UpdateDirectoryDto>(
      `/folders/${id}/location`,
      body
    );

    return data;
  }
}
