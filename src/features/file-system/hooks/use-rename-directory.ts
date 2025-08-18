import { useSWRConfig } from 'swr';

import { findCacheKeysByPattern } from '@hooks/cache-keys';

import { DirectoriesService } from '@services/directories/directories-service';

import type { Directory } from '@shared-types/entities';

type RenameDirectoryParams = {
  id: string;
  name: string;
};

export const useRenameDirectory = () => {
  const { mutate } = useSWRConfig();

  const renameDirectory = async ({ id, name }: RenameDirectoryParams) => {
    // Update all directory caches that might contain this directory
    await mutate(
      findCacheKeysByPattern(['directories']),
      async (current?: Directory[]): Promise<Directory[]> => {
        // API call - errors handled by Axios interceptor globally
        await DirectoriesService.updateDirectory(id, {
          name,
          type: 'folder', // Assuming all directories are folders for now
        });

        // Return updated data
        if (!current) return [];

        return current.map(dir => (dir.id === id ? { ...dir, name } : dir));
      },
      {
        optimisticData: (current?: Directory[]): Directory[] => {
          // Immediate optimistic update - update name in UI
          if (!current) return [];

          return current.map(dir => (dir.id === id ? { ...dir, name } : dir));
        },
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  return { renameDirectory };
};
