import { MUTATION_KEYS } from '@hooks/cache-keys';

import type { SignInRequest } from '@services/auth/auth-dtos';
import { AuthService } from '@services/auth/auth-service';

import { useSWRMutation } from '@lib/swr';

type SignInFetcherArgs = {
  arg: SignInRequest;
};

export const useSignIn = () => {
  const {
    trigger: signIn,
    isMutating: isLoading,
    error,
  } = useSWRMutation(
    MUTATION_KEYS.auth.signIn,
    async (_key: string, { arg }: SignInFetcherArgs) => {
      return AuthService.signIn(arg);
    }
  );

  return { signIn, isLoading, error };
};
