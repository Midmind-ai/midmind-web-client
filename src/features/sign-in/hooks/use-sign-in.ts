import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@/constants/api';
import type { SignInRequest } from '@/services/auth/auth-dtos';
import { AuthService } from '@/services/auth/auth-service';

type SignInFetcherArgs = {
  arg: SignInRequest;
};

export const useSignIn = () => {
  const {
    trigger: signIn,
    isMutating: isLoading,
    error,
  } = useSWRMutation(
    SWRCacheKeys.SignIn,
    async (_key: readonly unknown[], { arg }: SignInFetcherArgs) => {
      return AuthService.signIn(arg);
    }
  );

  return { signIn, isLoading, error };
};
