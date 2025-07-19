import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';

import { LocalStorageKeys } from '@shared/constants/localStorage';
import { AppRoutes } from '@shared/constants/router';

import type { SignInRequest } from '@shared/services/auth/types';

import { setToStorage } from '@shared/utils/localStorage';

import { useSignIn } from '@features/SignIn/hooks/useSignIn';

const signInValidationSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const useSignInFormLogic = () => {
  const navigate = useNavigate();
  const { signIn } = useSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInRequest>({
    resolver: zodResolver(signInValidationSchema),
  });

  const handleSignIn = (data: SignInRequest) => {
    signIn(data, {
      onSuccess: response => {
        // eslint-disable-next-line no-console
        console.log('response', response);

        setToStorage(LocalStorageKeys.AccessToken, response.access_token);
        navigate(AppRoutes.Home);
      },
      onError: error => {
        // eslint-disable-next-line no-console
        console.log('error', error);
      },
    });
  };

  return {
    errors,
    isSubmitting,
    register,
    handleSubmit: handleSubmit(handleSignIn),
    navigate,
  };
};
