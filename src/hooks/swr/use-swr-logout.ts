import { MUTATION_KEYS } from '@hooks/cache-keys';
import { useSWRMutation } from '@lib/swr';
import { AuthService } from '@services/auth/auth-service';

export function useSwrLogout() {
  return useSWRMutation(MUTATION_KEYS.auth.logout, AuthService.logout);
}
