import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import { authService } from '@shared/services/auth';
import type { SignInRequest, TokenResponse } from '@shared/services/auth/types';

type SignInFetcherArgs = {
  arg: SignInRequest;
};

const fetcher = async (_key: string, { arg }: SignInFetcherArgs): Promise<TokenResponse> => {
  return authService.signIn(arg);
};

export const useSignIn = () => {
  const {
    trigger: signIn,
    isMutating: isLoading,
    error,
  } = useSWRMutation(SWRCacheKeys.SignIn, fetcher);

  return { signIn, isLoading, error };
};
