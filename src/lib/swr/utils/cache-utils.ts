import { unstable_serialize } from 'swr';

import type { Key, Cache } from 'swr';

// Helper to get cache value for any key type
export const getCacheValue = (cache: Cache<unknown>, key: Key): unknown => {
  // Use SWR's internal serialization to match how keys are stored
  const serializedKey = unstable_serialize(key);

  return cache.get(serializedKey);
};

// Safe cache value getter that handles null/undefined keys
export const getCacheValueSafe = (
  cache: Cache<unknown>,
  key: Key | null | undefined
): unknown => {
  if (!key) {
    return undefined;
  }

  return getCacheValue(cache, key);
};

// Helper to get multiple cache values when using filter functions
export const getCacheValuesForFilterFunction = (
  cache: Cache<unknown>,
  filterFn: (key: string) => boolean
): Array<{ key: string; value: unknown }> => {
  const results: Array<{ key: string; value: unknown }> = [];

  // Iterate through cache keys and apply filter
  const keys = Array.from(cache.keys());
  for (const key of keys) {
    if (typeof key === 'string') {
      try {
        // Call the filter function and check if it matches
        if (filterFn(key)) {
          results.push({
            key,
            value: cache.get(key),
          });
        }
      } catch {
        // If filter function fails, skip this key
        continue;
      }
    }
  }

  return results;
};
