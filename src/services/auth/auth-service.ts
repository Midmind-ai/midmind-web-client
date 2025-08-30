import { authAxiosInstance, baseAxiosInstance } from '@config/axios';

import type {
  SignInRequestDto,
  SignInWithGoogleRequestDto,
  TokenResponseDto,
} from '@services/auth/auth-dtos';

import type { MessageResponse } from '@shared-types/common';

export class AuthService {
  static async signIn(requestBody: SignInRequestDto) {
    const { data } = await authAxiosInstance.post<TokenResponseDto>(
      '/sign-in',
      requestBody
    );

    return data;
  }

  static async signInWithGoogle(requestBody: SignInWithGoogleRequestDto) {
    const { data } = await authAxiosInstance.post<TokenResponseDto>(
      '/google',
      requestBody
    );

    return data;
  }

  static async logout() {
    const { data } = await baseAxiosInstance.post<MessageResponse>('auth/logout');

    return data;
  }

  static async refreshToken() {
    const { data } = await authAxiosInstance.post<TokenResponseDto>('/refresh');

    return data;
  }
}
