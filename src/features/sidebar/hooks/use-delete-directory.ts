import { useState } from 'react';

import { produce } from 'immer';
import { mutate } from 'swr';

import { SWRCacheKeys } from '@/constants/api';
import { DirectoriesService } from '@/services/directories/directories-service';
import type { Directory } from '@/types/entities';
import { CacheSelectors } from '@/utils/cache-selectors';

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
      const cacheKey = SWRCacheKeys.GetDirectories(parentDirectoryId);

      await mutate(
        cacheKey,
        produce((draft?: Directory[]) => {
          if (!draft) {
            return draft;
          }

          return draft.filter(dir => dir.id !== id);
        }),
        { revalidate: false, rollbackOnError: true }
      );

      // Make the API call
      await DirectoriesService.deleteDirectory(id);

      // If this directory has a parent, check if parent should update has_children flag
      if (parentDirectoryId) {
        // Check if the parent has any remaining children
        await mutate(cacheKey, async (currentDirectories?: Directory[]) => {
          const remainingDirectories = currentDirectories || [];
          const hasRemainingChildren = remainingDirectories.length > 0;

          // Update parent's has_children flag in all caches
          await mutate(
            CacheSelectors.allDirectories,
            produce((draft?: Directory[]) => {
              if (!draft) {
                return draft;
              }

              const parentIndex = draft.findIndex(dir => dir.id === parentDirectoryId);
              if (parentIndex !== -1) {
                draft[parentIndex].has_children = hasRemainingChildren;
              }
            }),
            { revalidate: false }
          );

          return currentDirectories;
        });
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
