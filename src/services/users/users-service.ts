import { baseAxiosInstance } from '@/config/axios';
import type { User } from '@/types/entities';

export class UsersService {
  static async getCurrentUser() {
    const { data } = await baseAxiosInstance.get<User>('/users/current');

    return data;
  }
}
