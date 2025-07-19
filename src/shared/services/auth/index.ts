import { authAxiosInstance } from '@shared/config/axios';

import { ApiEndpoints } from '@shared/constants/api';

import type { SignInRequest, TokenResponse } from '@shared/services/auth/types';

import type { MessageResponse } from '@shared/types/common';

const signIn = async (data: SignInRequest) => {
  const response = await authAxiosInstance.post<TokenResponse>(ApiEndpoints.SignIn, data);

  return response.data;
};

const logout = async () => {
  const response = await authAxiosInstance.post<MessageResponse>(ApiEndpoints.Logout);

  return response.data;
};

export const authService = {
  signIn,
  logout,
};
