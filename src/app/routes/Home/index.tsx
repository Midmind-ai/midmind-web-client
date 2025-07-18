import type { FC } from 'react';

import { useNavigate } from 'react-router';

import { Button } from '@/components/Button';

import { LocalStorageKeys } from '@/constants/localStorage';
import { AppRoutes } from '@/constants/router';

import { useLogout } from '@/hooks/useLogout';

import { removeFromStorage } from '@/utils/localStorage';

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
