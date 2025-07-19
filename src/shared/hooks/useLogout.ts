import useSWRMutation from 'swr/mutation';

import { ApiEndpoints } from '@shared/constants/api';

import { authService } from '@shared/services/auth';

export const useLogout = () => {
  const {
    trigger: logout,
    isMutating: isLoading,
    error,
  } = useSWRMutation(ApiEndpoints.Logout, authService.logout);

  return { logout, isLoading, error };
};
