import type { FC } from 'react';

import { useNavigate } from 'react-router';

import { Button } from '@shared/components/Button';

import { LocalStorageKeys } from '@shared/constants/localStorage';
import { AppRoutes } from '@shared/constants/router';

import { useLogout } from '@shared/hooks/useLogout';

import { removeFromStorage } from '@shared/utils/localStorage';

const Home: FC = () => {
  const navigate = useNavigate();
  const { logout, isLoading } = useLogout();

  const handleLogout = () => {
    logout(null, {
      onSuccess: () => {
        removeFromStorage(LocalStorageKeys.AccessToken);

        navigate(AppRoutes.SignIn);
      },
      onError: error => {
        // eslint-disable-next-line no-console
        console.log('error', error);
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Button
        disabled={isLoading}
        variant="destructive"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </div>
  );
};

export default Home;
