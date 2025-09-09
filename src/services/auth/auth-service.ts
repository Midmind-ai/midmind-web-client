import { authAxiosInstance, baseAxiosInstance } from '@config/axios';
import type {
  SignInRequest,
  SignInWithGoogleRequest,
  TokenResponse,
} from '@services/auth/auth-dtos';
import type { MessageResponse } from '@shared-types/common';

export class AuthService {
  static async signIn(requestBody: SignInRequest) {
    const { data } = await authAxiosInstance.post<TokenResponse>('/sign-in', requestBody);

    return data;
  }

  static async signInWithGoogle(requestBody: SignInWithGoogleRequest) {
    const { data } = await authAxiosInstance.post<TokenResponse>('/google', requestBody);

    return data;
  }

  static async logout() {
    const { data } = await baseAxiosInstance.post<MessageResponse>('auth/logout');

    return data;
  }

  static async refreshToken() {
    const { data } = await authAxiosInstance.post<TokenResponse>('/refresh');

    return data;
  }
}
