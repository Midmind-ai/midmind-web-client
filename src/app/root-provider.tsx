import { GoogleOAuthProvider } from '@react-oauth/google';
import { RouterProvider } from 'react-router';

import DevTools from '@app/components/dev-tools';
import ModalsRenderer from '@app/modals-renderer';
import { SWRProvider } from '@app/providers/swr-provider';
import { ThemeProvider } from '@app/providers/theme-provider';
import router from '@app/router';

import { TooltipProvider } from '@components/ui/tooltip';

import { LocalStorageKeys } from '@constants/local-storage';

import { TOOLTIP_DELAY } from '@features/sidebar/components/tree-node/constants';

const RootProvider = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider
        defaultTheme="light"
        storageKey={LocalStorageKeys.Theme}
      >
        <SWRProvider>
          <TooltipProvider delayDuration={TOOLTIP_DELAY}>
            <RouterProvider router={router} />
            <ModalsRenderer />
            {import.meta.env.DEV && <DevTools />}
          </TooltipProvider>
        </SWRProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default RootProvider;
