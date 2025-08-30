import { zodResolver } from '@hookform/resolvers/zod';
import { useGoogleLogin } from '@react-oauth/google';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';

import { LocalStorageKeys } from '@constants/local-storage';
import { AppRoutes } from '@constants/paths';

import { useSignIn } from '@features/sign-in/hooks/use-sign-in';

import { CACHE_KEYS } from '@hooks/cache-keys';

import type { SignInRequestDto } from '@services/auth/auth-dtos';
import { AuthService } from '@services/auth/auth-service';

import { setToStorage } from '@utils/local-storage';

import { useSWRConfig } from '@lib/swr';

const signInValidationSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const useSignInFormLogic = () => {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const { signIn, isLoading } = useSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInRequestDto>({
    resolver: zodResolver(signInValidationSchema),
  });

  const loginWithGoogle = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async tokenResponse => {
      const response = await AuthService.signInWithGoogle({
        code: tokenResponse.code,
      });

      setToStorage(LocalStorageKeys.AccessToken, response.access_token);

      await mutate(CACHE_KEYS.auth.currentUser);

      navigate(AppRoutes.Home, { replace: true });
    },
    onError: error => {
      console.error('Google OAuth error:', error);
      // TODO: Add proper user notification for Google OAuth errors
    },
  });

  const handleSignIn = (data: SignInRequestDto) => {
    signIn(data, {
      onSuccess: async response => {
        setToStorage(LocalStorageKeys.AccessToken, response.access_token);

        await mutate(CACHE_KEYS.auth.currentUser);

        navigate(AppRoutes.Home, { replace: true });
      },
      onError: error => {
        console.error('Sign in error:', error);
        // TODO: Add proper user notification for  errors
      },
    });
  };

  return {
    errors,
    isSubmitting: isLoading,
    register,
    loginWithGoogle,
    handleSubmit: handleSubmit(handleSignIn),
    navigate,
  };
};
