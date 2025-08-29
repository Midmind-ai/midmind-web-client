import originalUseSWR, { type SWRResponse, type Key, useSWRConfig } from 'swr';

import { getSWRLogger } from '../logger';
import { getCacheValueSafe } from '../utils/cache-utils';

// Wrapped useSWR with logging
export const useSWR = <Data = unknown, Error = unknown>(
  key: Key,
  fetcher?: unknown,
  config?: unknown
): SWRResponse<Data, Error> => {
  // Get cache instance and logger
  const { cache } = useSWRConfig();
  const logger = getSWRLogger();

  // Capture before state
  const beforeData = getCacheValueSafe(cache, key);

  // Call original useSWR with enhanced config
  const result = originalUseSWR(
    key,
    fetcher as never,
    {
      ...(config as Record<string, unknown>),
      onSuccess: (data: Data) => {
        // Log the cache change
        const keyStr = String(key ?? 'undefined');
        logger.logUseSWR(keyStr, beforeData, data);

        // Call original onSuccess if provided
        const originalConfig = config as { onSuccess?: (data: Data) => void };
        originalConfig?.onSuccess?.(data);
      },
    } as never
  );

  return result as SWRResponse<Data, Error>;
};
