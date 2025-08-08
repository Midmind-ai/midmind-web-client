import { useNavigate } from 'react-router';
import { useSWRConfig } from 'swr';

import { useSidebar } from '@shared/components/ui/sidebar';

import { SWRCacheKeys } from '@shared/constants/api';
import { LocalStorageKeys } from '@shared/constants/local-storage';
import { AppRoutes } from '@shared/constants/router';

import { useCurrentUser } from '@shared/hooks/use-current-user';
import { useLogout } from '@shared/hooks/use-logout';

import { removeFromStorage } from '@shared/utils/local-storage';

export const useUserDropdownLogic = () => {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const { isMobile } = useSidebar();
  const { logout, isLoading } = useLogout();
  const { avatar, first_name, last_name, email } = useCurrentUser();

  const handleLogout = async () => {
    await logout(null, {
      onSuccess: async () => {
        await mutate(SWRCacheKeys.CurrentUser);

        removeFromStorage(LocalStorageKeys.AccessToken);

        navigate(AppRoutes.SignIn);
      },
    });
  };

  return {
    avatar,
    first_name,
    last_name,
    email,
    isLoading,
    isMobile,
    handleLogout,
  };
};
