import { authAxiosInstance } from '@config/axios';
import type {
  SignInRequest,
  SignInWithGoogleRequest,
  SignUpRequest,
  TokenResponse,
  MessageResponse,
} from '@services/auth/auth-dtos';

export class AuthService {
  static async signIn(requestBody: SignInRequest) {
    const { data } = await authAxiosInstance.post<TokenResponse>('/sign-in', requestBody);

    return data;
  }

  static async signUp(requestBody: SignUpRequest) {
    const { data } = await authAxiosInstance.post<TokenResponse>('/sign-up', requestBody);

    return data;
  }

  static async signInWithGoogle(requestBody: SignInWithGoogleRequest) {
    const { data } = await authAxiosInstance.post<TokenResponse>('/google', requestBody);

    return data;
  }

  static async logout() {
    const { data } = await authAxiosInstance.post<MessageResponse>('/logout');

    return data;
  }

  static async refreshToken() {
    const { data } = await authAxiosInstance.post<TokenResponse>('/refresh');

    return data;
  }
}
