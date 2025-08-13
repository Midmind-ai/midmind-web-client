import { apiConfig } from '@/config/api';

import type { SWRConfiguration } from 'swr';

/**
 * Global SWR configuration
 * @see https://swr.vercel.app/docs/global-configuration
 */
export const swrConfig: SWRConfiguration = {
  // Error handling
  shouldRetryOnError: false,

  // Revalidation settings
  revalidateOnFocus: false,
  revalidateOnReconnect: false,

  // Deduplication
  dedupingInterval: apiConfig.timeout,
};
