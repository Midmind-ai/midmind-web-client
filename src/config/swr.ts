import type { SWRConfiguration } from '@lib/swr';

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
  dedupingInterval: 0,
};

/**
 * Global SWR Mutation configuration
 * @see https://swr.vercel.app/docs/mutation#global-configuration
 */
export const swrMutationConfig = {
  // Automatically rollback optimistic updates on error
  rollbackOnError: true,

  // Don't throw errors in components, handle via mutation.error
  throwOnError: false,
} as const;
