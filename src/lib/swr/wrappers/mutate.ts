import { mutate as originalMutate, type Key, type MutatorOptions, type Cache } from 'swr';

import { getSWRLogger } from '../logger';
import { getCacheValueSafe, getCacheValuesForFilterFunction } from '../utils/cache-utils';

// Generic mutate wrapper with logging that can wrap any mutate function
export const createMutateWithLogging = <Data = unknown>(
  mutateFn: (
    key: Key,
    data?: Data | Promise<Data> | ((currentData?: Data) => Data | Promise<Data>),
    options?: MutatorOptions<Data>
  ) => Promise<Data | undefined>,
  cache?: Cache<unknown>
) => {
  return async (
    key: Key,
    data?: Data | Promise<Data> | ((currentData?: Data) => Data | Promise<Data>),
    options?: MutatorOptions<Data>
  ): Promise<Data | undefined> => {
    const logger = getSWRLogger();

    // Check if key is a filter function (for multiple keys)
    if (typeof key === 'function') {
      // Capture before state for filter function mutations
      const filterFn = key as (key: string) => boolean;
      const beforeState = cache
        ? getCacheValuesForFilterFunction(cache, filterFn)
        : undefined;
      const resolvedData = await Promise.resolve(data);

      // Call the provided mutate function
      const result = await mutateFn(key, data, options);

      // Capture after state for filter function mutations
      const afterState = cache
        ? getCacheValuesForFilterFunction(cache, filterFn)
        : undefined;

      // Log filter function mutation with before/after data
      const matchedKeys = Array.isArray(result) ? result.length : 0;
      logger.logMutate(
        'filter-function',
        resolvedData,
        options,
        result,
        matchedKeys,
        beforeState,
        afterState
      );

      return result;
    }

    // Single key mutation - capture before state
    const beforeData = cache ? getCacheValueSafe(cache, key) : undefined;
    const resolvedData = await Promise.resolve(data);

    // Call the provided mutate function
    const result = await mutateFn(key, data, options);

    // Capture after state from the actual cache (not just the result)
    const afterData = cache ? getCacheValueSafe(cache, key) : result;

    // Log single key mutation with before/after data
    logger.logMutate(
      String(key),
      resolvedData,
      options,
      result,
      undefined,
      beforeData,
      afterData
    );

    return result;
  };
};

// Wrapped standalone mutate with logging
// Note: Standalone mutate doesn't have direct access to cache instance,
// so before/after data won't be captured for standalone usage.
// Use useSWRConfig().mutate for full before/after logging.
export const mutate = createMutateWithLogging(originalMutate);
