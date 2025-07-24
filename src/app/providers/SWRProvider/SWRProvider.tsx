import { type PropsWithChildren } from 'react';

import { SWRConfig } from 'swr';

import { TIMEOUT } from '@/shared/constants/api';

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
      {children}
    </SWRConfig>
  );
};
