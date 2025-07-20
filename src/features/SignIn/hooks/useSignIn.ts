import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import { AuthService } from '@shared/services/auth/authService';
import type { SignInRequest } from '@shared/services/auth/types';

type SignInFetcherArgs = {
  arg: SignInRequest;
};

const fetcher = async (_key: string, { arg }: SignInFetcherArgs) => {
  return AuthService.signIn(arg);
};

export const useSignIn = () => {
  const {
    trigger: signIn,
    isMutating: isLoading,
    error,
  } = useSWRMutation(SWRCacheKeys.SignIn, fetcher);

  return { signIn, isLoading, error };
};
