import { zodResolver } from '@hookform/resolvers/zod';
import { useGoogleLogin } from '@react-oauth/google';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';

import { ApiErrorCodes } from '@shared/constants/api';
import { LocalStorageKeys } from '@shared/constants/localStorage';
import { AppRoutes } from '@shared/constants/router';

import type { SignInRequest } from '@shared/services/auth/types';

import { setToStorage } from '@shared/utils/localStorage';

import { useSignIn } from '@features/SignIn/hooks/useSignIn';

import { AuthService } from '@/shared/services/auth/authService';

const signInValidationSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const useSignInFormLogic = () => {
  const navigate = useNavigate();
  const { signIn } = useSignIn();
  const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInRequest>({
    resolver: zodResolver(signInValidationSchema),
  });

  const loginWithGoogle = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async tokenResponse => {
      try {
        const response = await AuthService.signInWithGoogle({ code: tokenResponse.code });

        setToStorage(LocalStorageKeys.AccessToken, response.access_token);

        navigate(AppRoutes.Home);
      } catch (error) {
        console.error('Google sign-in failed:', error);
        // TODO: Add proper user notification for Google sign-in errors
      }
    },
    onError: error => {
      console.error('Google OAuth error:', error);
      // TODO: Add proper user notification for Google OAuth errors
    },
  });

  const handleSignIn = (data: SignInRequest) => {
    signIn(data, {
      onSuccess: response => {
        setToStorage(LocalStorageKeys.AccessToken, response.access_token);

        navigate(AppRoutes.Home);
      },
      onError: error => {
        switch (error.response?.status) {
          case ApiErrorCodes.Forbidden:
            setError('password', { message: error.response?.data.message });
            break;
          case ApiErrorCodes.NotFound:
            setError('email', { message: error.response?.data.message });
            break;
          default:
            break;
        }
      },
    });
  };

  return {
    errors,
    isSubmitting,
    register,
    loginWithGoogle,
    handleSubmit: handleSubmit(handleSignIn),
    navigate,
  };
};
