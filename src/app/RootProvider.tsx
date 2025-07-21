import { GoogleOAuthProvider } from '@react-oauth/google';
import { RouterProvider } from 'react-router';

import { ThemeProvider } from '@app/providers/ThemeProvider/ThemeProvider';

import { LocalStorageKeys } from '@shared/constants/localStorage';

import router from '@/app/Router';

const RootProvider = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider
        defaultTheme="light"
        storageKey={LocalStorageKeys.Theme}
      >
        <RouterProvider router={router} />
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default RootProvider;
