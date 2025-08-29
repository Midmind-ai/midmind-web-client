import { type Key, useSWRConfig, type Cache } from 'swr';
import originalUseSWRInfinite, { type SWRInfiniteResponse } from 'swr/infinite';

import { getSWRLogger } from '../logger';

// Helper to get cache value
const getCacheValue = (cache: Cache<unknown>, key: Key): unknown => {
  if (typeof key === 'string') {
    return cache.get(key);
  }
  const serializedKey = JSON.stringify(key);

  return cache.get(serializedKey);
};

// Wrapped useSWRInfinite with logging
export const useSWRInfinite = <Data = unknown, Error = unknown>(
  getKey: (pageIndex: number, previousPageData: Data | null) => Key | null,
  fetcher?: unknown,
  config?: unknown
): SWRInfiniteResponse<Data, Error> => {
  // Get cache instance and logger
  const { cache } = useSWRConfig();
  const logger = getSWRLogger();

  // Get the first page key to check cache
  const firstKey = getKey(0, null);
  const beforeData = firstKey ? getCacheValue(cache, firstKey) : undefined;

  // Call original useSWRInfinite with enhanced config
  const result = originalUseSWRInfinite(
    getKey,
    fetcher as never,
    {
      ...(config as Record<string, unknown>),
      onSuccess: (data: Data[]) => {
        // Log the cache change
        const pages = data ? data.length : 0;
        logger.logUseSWRInfinite(String(firstKey), beforeData, data, pages);

        // Call original onSuccess if provided
        const originalConfig = config as { onSuccess?: (data: Data[]) => void };
        originalConfig?.onSuccess?.(data);
      },
    } as never
  );

  return result as SWRInfiniteResponse<Data, Error>;
};
