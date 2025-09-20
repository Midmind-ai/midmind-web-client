import type { User, UpdateUserRequest, MessageResponse } from './users-dtos';
import { baseAxiosInstance } from '@config/axios';

export class UsersService {
  static async getCurrentUser() {
    const { data } = await baseAxiosInstance.get<User>('/users/current');

    return data;
  }

  static async updateCurrentUser(requestBody: UpdateUserRequest) {
    const { data } = await baseAxiosInstance.put<MessageResponse>(
      '/users/current',
      requestBody
    );

    return data;
  }
}
