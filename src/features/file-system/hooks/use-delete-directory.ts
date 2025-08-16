import { useState } from 'react';

import { mutate } from 'swr';

import { CACHE_KEYS, invalidateCachePattern } from '@hooks/cache-keys';

import { DirectoriesService } from '@services/directories/directories-service';

type DeleteDirectoryParams = {
  id: string;
  parentDirectoryId?: string;
};

export const useDeleteDirectory = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteDirectory = async ({ id, parentDirectoryId }: DeleteDirectoryParams) => {
    setIsDeleting(true);

    try {
      // Optimistically remove from cache
      const parentDirectoryCacheKey =
        CACHE_KEYS.directories.withParent(parentDirectoryId);

      await mutate(parentDirectoryCacheKey, undefined, {
        revalidate: false,
        rollbackOnError: true,
      });

      // Make the API call
      await DirectoriesService.deleteDirectory(id);

      // If this directory has a parent, check if parent should update has_children flag
      if (parentDirectoryId) {
        // Check if the parent has any remaining children
        // Invalidate directory caches to refetch with updated has_children
        await mutate(invalidateCachePattern(['directories'])); // Root directories
        await mutate(invalidateCachePattern(['directories', '*'])); // All directory children
      }
    } catch (error) {
      console.error('Failed to delete directory:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteDirectory,
    isDeleting,
  };
};
