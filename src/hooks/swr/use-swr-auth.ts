import { LocalStorageKeys } from '@constants/local-storage';

import { CACHE_KEYS } from '@hooks/cache-keys';

import { UsersService } from '@services/users/users-service';

import { getFromStorage } from '@utils/local-storage';

import { useSWR } from '@lib/swr';

export function useSwrCurrentUser() {
  const accessToken = getFromStorage<string>(LocalStorageKeys.AccessToken);

  return useSWR(
    accessToken ? CACHE_KEYS.auth.currentUser : null,
    () => UsersService.getCurrentUser(),
    {
      revalidateOnMount: true,
    }
  );
}
