import useSWR from 'swr';

import { SWRCacheKeys } from '@shared/constants/api';
import { LocalStorageKeys } from '@shared/constants/localStorage';

import { UsersService } from '@shared/services/users/usersService';

import { useUserStore } from '@shared/stores/useUserStore';

import { getFromStorage } from '@shared/utils/localStorage';

export const useCheckAuth = () => {
  const { setUser, setAuthenticated, reset } = useUserStore();

  const accessToken = getFromStorage<string>(LocalStorageKeys.AccessToken);

  const { isLoading, data, error } = useSWR(
    accessToken ? SWRCacheKeys.CurrentUser : null,
    () => UsersService.getCurrentUser(),
    {
      onSuccess: user => {
        setUser(user);
        setAuthenticated(true);
      },
      onError: () => reset(),
    }
  );

  return {
    isLoading,
    data,
    error,
    isAuthenticated: !!data?.id && !error,
  };
};
