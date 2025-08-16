import { useSWRConfig } from 'swr';

/**
 * Hook that provides utilities for searching and manipulating SWR cache
 */
export const useCacheUtils = () => {
  const { cache } = useSWRConfig();

  /**
   * Search all cache entries matching a key pattern for an item by ID
   * @param keyPattern - First element of cache key to match (e.g., 'directories', 'chats')
   * @param itemId - ID of the item to find
   * @returns The found item and its cache key, or null if not found
   */
  const findInCache = <T extends { id: string }>(
    keyPattern: string,
    itemId: string
  ): { item: T; cacheKey: unknown[] } | null => {
    const keys = Array.from(cache.keys());

    for (const key of keys) {
      if (Array.isArray(key) && key[0] === keyPattern) {
        const data = cache.get(key);
        if (Array.isArray(data)) {
          const item = data.find((item: T) => item.id === itemId);
          if (item) {
            return { item, cacheKey: key };
          }
        }
      }
    }

    return null;
  };

  /**
   * Search all cache entries for an item by ID across multiple patterns
   * @param patterns - Array of key patterns to search
   * @param itemId - ID of the item to find
   * @returns The found item, its cache key, and the matched pattern
   */
  const findInCacheMultiple = <T extends { id: string }>(
    patterns: string[],
    itemId: string
  ): { item: T; cacheKey: unknown[]; pattern: string } | null => {
    for (const pattern of patterns) {
      const result = findInCache<T>(pattern, itemId);
      if (result) {
        return { ...result, pattern };
      }
    }

    return null;
  };

  /**
   * Get all items from cache entries matching a key pattern
   * @param keyPattern - First element of cache key to match
   * @returns Array of all items from matching caches
   */
  const getAllFromCache = <T>(keyPattern: string): T[] => {
    const items: T[] = [];
    const keys = Array.from(cache.keys());

    for (const key of keys) {
      if (Array.isArray(key) && key[0] === keyPattern) {
        const data = cache.get(key);
        if (Array.isArray(data)) {
          items.push(...data);
        }
      }
    }

    return items;
  };

  /**
   * Extract parent ID from a cache key based on standard patterns
   * @param cacheKey - The cache key array
   * @param entityType - Type of entity ('directory' or 'chat')
   * @returns The parent directory ID or null
   */
  const extractParentFromCacheKey = (
    cacheKey: unknown[],
    entityType: 'directory' | 'chat'
  ): string | null => {
    if (entityType === 'directory') {
      // ['directories'] for root, ['directories', parentId] for nested
      return cacheKey.length > 1 ? (cacheKey[1] as string) : null;
    }

    if (entityType === 'chat') {
      // ['chats'] for root, ['chats', 'directory', parentId] for nested
      if (cacheKey.length > 2 && cacheKey[1] === 'directory') {
        return cacheKey[2] as string;
      }

      return null;
    }

    return null;
  };

  /**
   * Check if a cache entry exists for the given key
   * @param cacheKey - The cache key to check
   * @returns True if cache entry exists, false otherwise
   */
  const cacheExists = (cacheKey: unknown[]): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cache.get(cacheKey as any) !== undefined;
  };

  return {
    findInCache,
    findInCacheMultiple,
    getAllFromCache,
    extractParentFromCacheKey,
    cacheExists,
    cache, // Expose cache for direct access if needed
  };
};
