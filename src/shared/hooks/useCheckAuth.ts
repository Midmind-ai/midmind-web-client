import useSWR from 'swr';

import { SWRCacheKeys } from '@shared/constants/api';
import { LocalStorageKeys } from '@shared/constants/localStorage';

import { usersService } from '@shared/services/users';

import { useUserStore } from '@shared/stores/useUserStore';

import { getFromStorage } from '@shared/utils/localStorage';

export const useCheckAuth = () => {
  const { setUser, setAuthenticated, reset } = useUserStore();

  const accessToken = getFromStorage<string>(LocalStorageKeys.AccessToken);

  const { isLoading, data, error } = useSWR(
    accessToken ? SWRCacheKeys.CurrentUser : null,
    usersService.getCurrentUser,
    {
      onSuccess: user => {
        setUser(user);
        setAuthenticated(true);
      },
      onError: () => reset(),
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      errorRetryCount: 0,
    }
  );

  return {
    isLoading,
    data,
    error,
    isAuthenticated: !!data?.id && !error,
  };
};
