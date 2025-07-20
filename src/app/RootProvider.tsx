import { RouterProvider } from 'react-router';

import { ThemeProvider } from '@app/providers/ThemeProvider/ThemeProvider';

import { LocalStorageKeys } from '@shared/constants/localStorage';

import router from '@/app/Router';

const Provider = () => {
  return (
    <ThemeProvider
      defaultTheme="light"
      storageKey={LocalStorageKeys.Theme}
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default Provider;
