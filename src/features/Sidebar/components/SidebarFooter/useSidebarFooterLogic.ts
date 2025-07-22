import { useNavigate } from 'react-router';

import { LocalStorageKeys } from '@/shared/constants/localStorage';
import { AppRoutes } from '@/shared/constants/router';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { useLogout } from '@/shared/hooks/useLogout';
import { removeFromStorage } from '@/shared/utils/localStorage';

export const useSidebarFooterLogic = () => {
  const navigate = useNavigate();
  const { logout, isLoading } = useLogout();
  const { avatar, first_name, last_name, email } = useCurrentUser();

  const handleLogout = async () => {
    await logout(null, {
      onSuccess: () => {
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
    handleLogout,
    isLoading,
  };
};
