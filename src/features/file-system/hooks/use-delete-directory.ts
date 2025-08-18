import { useSWRConfig } from 'swr';

import { CACHE_KEYS, findCacheKeysByPattern } from '@hooks/cache-keys';

import { DirectoriesService } from '@services/directories/directories-service';

import type { Directory } from '@shared-types/entities';

export const useDeleteDirectory = () => {
  const { mutate } = useSWRConfig();

  const deleteDirectory = async (id: string, parentDirectoryId?: string) => {
    const cacheKey = CACHE_KEYS.directories.withParent(parentDirectoryId);

    await mutate(
      cacheKey,
      async (current?: Directory[]): Promise<Directory[]> => {
        await DirectoriesService.deleteDirectory(id);

        // Clean up related caches only after successful deletion
        await mutate(findCacheKeysByPattern(['directories', id]), undefined);
        await mutate(findCacheKeysByPattern(['chats', 'directories', id]), undefined);

        // Return the updated data (without the deleted item)
        if (!current) return [];

        return current.filter(item => item.id !== id);
      },
      {
        optimisticData: (current?: Directory[]): Directory[] => {
          // Immediate optimistic update - remove the item from UI
          if (!current) return [];

          return current.filter(item => item.id !== id);
        },
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  return {
    deleteDirectory,
  };
};
