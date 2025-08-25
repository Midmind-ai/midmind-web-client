import { MUTATION_KEYS } from '@hooks/cache-keys';

import { AuthService } from '@services/auth/auth-service';

import { useSWRMutation } from '@lib/swr';

export function useSwrLogout() {
  return useSWRMutation(MUTATION_KEYS.auth.logout, AuthService.logout);
}
