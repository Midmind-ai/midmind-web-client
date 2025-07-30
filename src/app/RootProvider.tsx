import { GoogleOAuthProvider } from '@react-oauth/google';
import { RouterProvider } from 'react-router';

import { ThemeProvider } from '@app/providers/ThemeProvider/ThemeProvider';

import { LocalStorageKeys } from '@shared/constants/localStorage';

import ModalsRenderer from '@/app/ModalsRenderer';
import { SWRProvider } from '@/app/providers/SWRProvider/SWRProvider';
import router from '@/app/Router';

const RootProvider = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider
        defaultTheme="light"
        storageKey={LocalStorageKeys.Theme}
      >
        <SWRProvider>
          <RouterProvider router={router} />
          <ModalsRenderer />
        </SWRProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default RootProvider;
