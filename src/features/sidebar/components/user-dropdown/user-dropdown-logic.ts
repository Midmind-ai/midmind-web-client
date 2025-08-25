import { useNavigate } from 'react-router';

import { useTheme } from '@app/providers/theme-provider';

import { useSidebar } from '@components/ui/sidebar';

import { LocalStorageKeys } from '@constants/local-storage';
import { AppRoutes } from '@constants/paths';

import { CACHE_KEYS } from '@hooks/cache-keys';
import { useCurrentUser, useLogout } from '@hooks/logic/use-auth-operations';

import { removeFromStorage } from '@utils/local-storage';

import { useSWRConfig } from '@lib/swr';

export const useUserDropdownLogic = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { mutate } = useSWRConfig();
  const { isMobile } = useSidebar();
  const { logout, isLoading } = useLogout();
  const { avatar, first_name, last_name, email } = useCurrentUser();

  const handleLogout = async () => {
    await logout(null, {
      onSuccess: async () => {
        await mutate(CACHE_KEYS.auth.currentUser);

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
    theme,
    setTheme,
    handleLogout,
  };
};
