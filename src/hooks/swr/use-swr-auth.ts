import { LocalStorageKeys } from '@constants/local-storage';
import { CACHE_KEYS } from '@hooks/cache-keys';
import { useSWR } from '@lib/swr';
import { UsersService } from '@services/users/users-service';
import type { User } from '@shared-types/entities';
import { getFromStorage } from '@utils/local-storage';

export function useSwrCurrentUser() {
  const accessToken = getFromStorage<string>(LocalStorageKeys.AccessToken);

  return useSWR<User>(
    accessToken ? CACHE_KEYS.auth.currentUser : null,
    () => UsersService.getCurrentUser(),
    {
      revalidateOnMount: true,
    }
  );
}
