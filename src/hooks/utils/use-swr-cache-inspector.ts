import { useSWRConfig } from 'swr';

/**
 * Simple hook to inspect SWR cache programmatically.
 * For visual debugging, use the SWR DevTools browser extension instead.
 */
export const useSWRCacheInspector = () => {
  const { cache } = useSWRConfig();

  const inspectCache = () => {
    const keys = Array.from(cache.keys());

    // Sort keys by their string representation
    const sortedKeys = keys.sort((a, b) => {
      const aStr = Array.isArray(a) ? JSON.stringify(a) : String(a);
      const bStr = Array.isArray(b) ? JSON.stringify(b) : String(b);

      return aStr.localeCompare(bStr);
    });

    // Plain structure - raw cache data
    const plainCache: Record<string, unknown> = {};

    // Fancy structure - array of {key, data} objects to preserve array keys
    const fancyCache: Array<{ key: unknown; data: unknown }> = [];

    sortedKeys.forEach(key => {
      const data = cache.get(key);

      // Plain: use string representation of key
      const plainKey = Array.isArray(key) ? JSON.stringify(key) : String(key);
      plainCache[plainKey] = data;

      // Extract actual data from SWR response if it exists
      const extractedData =
        data && typeof data === 'object' && 'data' in data
          ? (data as { data: unknown }).data
          : data;

      // Fancy: preserve original key structure
      fancyCache.push({
        key: key,
        data: extractedData,
      });
    });

    // Single console.warn with both structures
    console.warn('🔍 SWR Cache Inspection:', {
      totalEntries: sortedKeys.length,
      plain: plainCache,
      fancy: fancyCache,
    });

    return { plainCache, fancyCache };
  };

  return { inspectCache };
};
