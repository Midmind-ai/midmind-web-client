import { useSWRConfig } from 'swr';

import type { Directory } from '@shared-types/entities';

export const useDirectoryNameLookup = () => {
  const { cache } = useSWRConfig();

  const getDirectoryName = (dirId?: string | null): string => {
    if (!dirId) {
      return 'root';
    }

    // Try to find directory in any cached directories
    const allCacheKeys = Array.from(cache.keys());

    // Look for array-based cache keys
    const directoryCacheKeys = allCacheKeys.filter(
      key => Array.isArray(key) && key[0] === 'directories'
    );

    for (const cacheKey of directoryCacheKeys) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const directories = cache.get(cacheKey as any) as Directory[] | undefined;
      if (directories) {
        const directory = directories.find(d => d.id === dirId);
        if (directory) {
          return directory.name;
        }
      }
    }

    // Also check if there's a specific cache entry for this directory ID
    const specificCacheKey = ['directories', dirId];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const specificDirectories = cache.get(specificCacheKey as any) as
      | Directory[]
      | undefined;
    if (specificDirectories) {
      const directory = specificDirectories.find(d => d.id === dirId);
      if (directory) {
        return directory.name;
      }
    }

    return dirId; // Fallback to ID if name not found
  };

  return { getDirectoryName };
};
