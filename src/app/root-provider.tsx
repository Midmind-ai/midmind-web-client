import { GoogleOAuthProvider } from '@react-oauth/google';
import { RouterProvider } from 'react-router';

import ModalsRenderer from '@app/modals-renderer';
import { SWRProvider } from '@app/providers/swr-provider';
import { ThemeProvider } from '@app/providers/theme-provider';
import router from '@app/router';

import { LocalStorageKeys } from '@/constants/local-storage';

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
