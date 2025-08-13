import { useEffect } from 'react';

import { useSwrCurrentUser } from '@/hooks/swr/use-swr-auth';
import { useSwrLogout } from '@/hooks/swr/use-swr-logout';
import { useUserStore } from '@/stores/use-user-store';

// Business logic hook that combines auth checking with user store management
export const useCheckAuth = () => {
  const { setUser, setAuthenticated, reset } = useUserStore();

  const { isLoading, data, error } = useSwrCurrentUser();

  // Handle success/error side effects
  useEffect(() => {
    if (data && !error) {
      setUser(data);
      setAuthenticated(true);
    }
  }, [data, error, setUser, setAuthenticated]);

  useEffect(() => {
    if (error) {
      reset();
    }
  }, [error, reset]);

  return {
    isLoading,
    data,
    error,
    isAuthenticated: !!data?.id && !error,
  };
};

// Business logic hook that provides current user with error handling
export const useCurrentUser = () => {
  const { user, isAuthenticated } = useUserStore();
  const { data } = useSwrCurrentUser();

  // Return the most up-to-date user data
  const currentUser = data || user;

  if (!isAuthenticated || !currentUser) {
    return {
      avatar: null,
      first_name: '',
      last_name: '',
      email: '',
      id: '',
    };
  }

  return currentUser;
};

// Business logic hook that handles logout with cleanup
export const useLogout = () => {
  const { trigger: logout, isMutating: isLoading, error } = useSwrLogout();

  return { logout, isLoading, error };
};
