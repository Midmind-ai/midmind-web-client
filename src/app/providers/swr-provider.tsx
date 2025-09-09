import { type PropsWithChildren } from 'react';
import { SWRDevTools } from 'swr-devtools';
import { swrConfig } from '@config/swr';
import { SWRConfig } from '@lib/swr';

export const SWRProvider = ({ children }: PropsWithChildren) => {
  return (
    <SWRConfig value={swrConfig}>
      <SWRDevTools>{children}</SWRDevTools>
    </SWRConfig>
  );
};
