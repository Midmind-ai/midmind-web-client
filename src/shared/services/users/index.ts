import { axiosInstance } from '@shared/config/axios';

import type { User } from '@shared/types/entities';

const getCurrentUser = async () => {
  const { data } = await axiosInstance.get<User>('/users/current');

  return data;
};

export const usersService = {
  getCurrentUser,
};
