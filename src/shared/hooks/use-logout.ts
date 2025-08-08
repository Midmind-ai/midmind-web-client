import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import { AuthService } from '@shared/services/auth/auth-service';

export const useLogout = () => {
  const {
    trigger: logout,
    isMutating: isLoading,
    error,
  } = useSWRMutation(SWRCacheKeys.Logout, AuthService.logout);

  return { logout, isLoading, error };
};
