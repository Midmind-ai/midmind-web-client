import { useState } from 'react';

import { mutate } from 'swr';
import { v4 as uuidv4 } from 'uuid';

import { SWRCacheKeys } from '@shared/constants/api';

import { DirectoriesService } from '@shared/services/directories/directories-service';

import type { Directory } from '@shared/types/entities';

type CreateDirectoryParams = {
  name: string;
  parentDirectoryId?: string;
};

export const useCreateDirectory = () => {
  const [isCreating, setIsCreating] = useState(false);

  const createDirectory = async ({ name, parentDirectoryId }: CreateDirectoryParams) => {
    setIsCreating(true);

    try {
      // Generate a unique ID for the new directory
      const newDirectoryId = uuidv4();

      // Create the directory object that will be added to cache
      const newDirectory: Directory = {
        id: newDirectoryId,
        name,
        type: 'folder',
        has_children: false,
      };

      // Optimistically update the cache
      const cacheKey = SWRCacheKeys.GetDirectories(parentDirectoryId);

      await mutate(
        cacheKey,
        async (currentDirectories?: Directory[]) => {
          // Add the new directory to the current list
          const updatedDirectories = [...(currentDirectories || []), newDirectory];

          // Make the API call
          await DirectoriesService.createDirectory({
            id: newDirectoryId,
            name,
            type: 'folder',
            parent_directory_id: parentDirectoryId,
          });

          return updatedDirectories;
        },
        {
          // Don't revalidate immediately since we're optimistically updating
          revalidate: false,
        }
      );

      // If this directory has a parent, update the parent's has_children flag
      if (parentDirectoryId) {
        // Find the parent cache key - it could be in any level
        // For now, we'll just revalidate to ensure consistency
        await mutate(
          key => typeof key === 'string' && key.startsWith('getDirectories'),
          undefined,
          { revalidate: true }
        );
      }

      return newDirectory;
    } catch (error) {
      console.error('Failed to create directory:', error);

      // Revalidate on error to ensure cache consistency
      await mutate(SWRCacheKeys.GetDirectories(parentDirectoryId), undefined, {
        revalidate: true,
      });

      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createDirectory,
    isCreating,
  };
};
