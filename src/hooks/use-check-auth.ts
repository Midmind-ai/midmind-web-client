import useSWR from 'swr';

import { SWRCacheKeys } from '@/constants/api';
import { LocalStorageKeys } from '@/constants/local-storage';
import { UsersService } from '@/services/users/users-service';
import { useUserStore } from '@/stores/use-user-store';
import { getFromStorage } from '@/utils/local-storage';

export const useCheckAuth = () => {
  const { setUser, setAuthenticated, reset } = useUserStore();

  const accessToken = getFromStorage<string>(LocalStorageKeys.AccessToken);

  const { isLoading, data, error } = useSWR(
    accessToken ? [SWRCacheKeys.CurrentUser, accessToken] : null,
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
