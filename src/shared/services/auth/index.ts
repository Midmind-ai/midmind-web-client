import { authAxiosInstance } from '@shared/config/axios';

import type { SignInRequest, TokenResponse } from '@shared/services/auth/types';

import type { MessageResponse } from '@shared/types/common';

const signIn = async (data: SignInRequest) => {
  const response = await authAxiosInstance.post<TokenResponse>('/sign-in', data);

  return response.data;
};

const logout = async () => {
  const response = await authAxiosInstance.post<MessageResponse>('/logout');

  return response.data;
};

export const refreshToken = async () => {
  const response = await authAxiosInstance.post<TokenResponse>('/refresh');

  return response.data;
};

export const authService = {
  signIn,
  logout,
  refreshToken,
};
