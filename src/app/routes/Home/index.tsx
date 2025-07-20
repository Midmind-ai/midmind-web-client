import type { FC } from 'react';

import { useNavigate } from 'react-router';

import { Button } from '@shared/components/Button';
import { ThemedH1 } from '@shared/components/ThemedH1';
import { ThemedP } from '@shared/components/ThemedP';

import { LocalStorageKeys } from '@shared/constants/localStorage';
import { AppRoutes } from '@shared/constants/router';

import { useLogout } from '@shared/hooks/useLogout';

import { removeFromStorage } from '@shared/utils/localStorage';

import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { useUserStore } from '@/shared/stores/useUserStore';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const Home: FC = () => {
  const navigate = useNavigate();
  const { logout, isLoading } = useLogout();
  const { reset } = useUserStore();
  const user = useCurrentUser();

  const handleLogout = () => {
    logout(null, {
      onSuccess: () => {
        removeFromStorage(LocalStorageKeys.AccessToken);
        navigate(AppRoutes.SignIn);
        reset();
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <ThemedH1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Welcome back!
            </ThemedH1>
            <ThemedP className="text-gray-600 dark:text-gray-400 text-sm">Your profile</ThemedP>
          </div>

          <div className="flex justify-center mb-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.first_name} ${user.last_name}`}
                className="w-16 h-16 rounded-full object-cover border-3 border-white dark:border-gray-700 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-3 border-white dark:border-gray-700 shadow-md">
                <span className="text-white text-lg font-bold">
                  {getInitials(user.first_name, user.last_name)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <div className="text-center">
              <ThemedH1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.first_name} {user.last_name}
              </ThemedH1>
              <ThemedP className="text-gray-600 dark:text-gray-400 text-sm">
                @{user.username}
              </ThemedP>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <ThemedP className="text-xs text-gray-600 dark:text-gray-400">Email:</ThemedP>
                <ThemedP className="text-xs font-medium text-gray-900 dark:text-white">
                  {user.email}
                </ThemedP>
              </div>

              <div className="flex items-center justify-between">
                <ThemedP className="text-xs text-gray-600 dark:text-gray-400">Joined:</ThemedP>
                <ThemedP className="text-xs font-medium text-gray-900 dark:text-white">
                  {formatDate(user.created_at)}
                </ThemedP>
              </div>
            </div>
          </div>

          <Button
            disabled={isLoading}
            variant="destructive"
            onClick={handleLogout}
            className="w-full"
          >
            {isLoading ? 'Signing out...' : 'Sign out'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
