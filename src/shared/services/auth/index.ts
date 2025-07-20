import { axiosInstance } from '@shared/config/axios';

import type { SignInRequest, TokenResponse } from '@shared/services/auth/types';

import type { MessageResponse } from '@shared/types/common';

const signIn = async (requestBody: SignInRequest) => {
  const { data } = await axiosInstance.post<TokenResponse>('/auth/sign-in', requestBody);

  return data;
};

const logout = async () => {
  const { data } = await axiosInstance.post<MessageResponse>('/auth/logout');

  return data;
};

export const refreshToken = async () => {
  const { data } = await axiosInstance.post<TokenResponse>('/auth/refresh');

  return data;
};

export const authService = {
  signIn,
  logout,
  refreshToken,
};
