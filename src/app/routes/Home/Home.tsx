import { useNavigate } from 'react-router';

import { useTheme } from '@app/providers/ThemeProvider/ThemeProvider';

import { Button } from '@shared/components/Button';
import { ThemedH1 } from '@shared/components/ThemedH1';
import { ThemedP } from '@shared/components/ThemedP';

import { LocalStorageKeys } from '@/shared/constants/localStorage';
import { AppRoutes } from '@/shared/constants/router';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { useLogout } from '@/shared/hooks/useLogout';
import { removeFromStorage } from '@/shared/utils/localStorage';

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const Home = () => {
  const navigate = useNavigate();
  const { logout, isLoading } = useLogout();
  const { theme, setTheme } = useTheme();
  const user = useCurrentUser();

  const handleLogout = () => {
    logout(null, {
      onSuccess: () => {
        removeFromStorage(LocalStorageKeys.AccessToken);
        navigate(AppRoutes.SignIn);
      },
    });
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
                className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-md">
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
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </ThemedP>
              </div>

              <div className="flex items-center justify-between">
                <ThemedP className="text-xs text-gray-600 dark:text-gray-400">Theme:</ThemedP>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme === 'dark'}
                    onChange={handleThemeToggle}
                    className="sr-only"
                  />
                  <div className="relative w-10 h-6 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out dark:bg-gray-600">
                    <div
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`}
                    />
                  </div>
                  <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                    {theme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </label>
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
