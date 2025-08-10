import { type PropsWithChildren } from 'react';

import { SWRConfig } from 'swr';
import { SWRDevTools } from 'swr-devtools';

import { TIMEOUT } from '@shared/constants/api';

export const SWRProvider = ({ children }: PropsWithChildren) => {
  return (
    <SWRConfig
      value={{
        shouldRetryOnError: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: TIMEOUT,
      }}
    >
      <SWRDevTools>{children}</SWRDevTools>
    </SWRConfig>
  );
};
