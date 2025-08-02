import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import { AuthService } from '@shared/services/auth/authService';
import type { SignInRequest } from '@shared/services/auth/types';

type SignInFetcherArgs = {
  arg: SignInRequest;
};

export const useSignIn = () => {
  const {
    trigger: signIn,
    isMutating: isLoading,
    error,
  } = useSWRMutation(SWRCacheKeys.SignIn, async (_key: string, { arg }: SignInFetcherArgs) => {
    return AuthService.signIn(arg);
  });

  return { signIn, isLoading, error };
};
