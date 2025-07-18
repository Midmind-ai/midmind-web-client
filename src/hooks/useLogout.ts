import useSWRMutation from 'swr/mutation';

import { authAxiosInstance } from '@/config/axios';

import { ApiEndpoints } from '@/constants/api';

import type { MessageResponse } from '@/types/common';

const fetcher = async () => {
  const response = await authAxiosInstance.post<MessageResponse>(ApiEndpoints.Logout);

  return response.data;
};

export const useLogout = () => {
  const {
    trigger: logout,
    isMutating: isLoading,
    error,
  } = useSWRMutation(ApiEndpoints.Logout, fetcher);

  return { logout, isLoading, error };
};
