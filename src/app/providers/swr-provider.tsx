import { type PropsWithChildren } from 'react';

import { SWRConfig } from 'swr';
import { SWRDevTools } from 'swr-devtools';

import { swrConfig } from '@config/swr';

export const SWRProvider = ({ children }: PropsWithChildren) => {
  return (
    <SWRConfig value={swrConfig}>
      <SWRDevTools>{children}</SWRDevTools>
    </SWRConfig>
  );
};
