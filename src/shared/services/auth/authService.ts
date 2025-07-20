import { authAxiosInstance, baseAxiosInstance } from '@shared/config/axios';

import type { SignInRequest, TokenResponse } from '@shared/services/auth/types';

import type { MessageResponse } from '@shared/types/common';

export class AuthService {
  static async signIn(requestBody: SignInRequest) {
    const { data } = await authAxiosInstance.post<TokenResponse>('/sign-in', requestBody);

    return data;
  }

  static async logout() {
    const { data } = await baseAxiosInstance.post<MessageResponse>('/auth/logout');

    return data;
  }

  static async refreshToken() {
    const { data } = await authAxiosInstance.post<TokenResponse>('/refresh');

    return data;
  }
}
