import { useState } from 'react';

import { produce } from 'immer';
import { mutate } from 'swr';
import { v4 as uuidv4 } from 'uuid';

import { CACHE_KEYS, invalidateCachePattern } from '@hooks/cache-keys';

import { DirectoriesService } from '@services/directories/directories-service';

import type { Directory } from '@shared-types/entities';

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

      // Optimistically update the cache using new cache selector system
      const cacheKey = CACHE_KEYS.directories.withParent(parentDirectoryId);

      await mutate(
        cacheKey,
        produce((draft?: Directory[]) => {
          if (!draft) {
            return [newDirectory];
          }
          draft.unshift(newDirectory); // Add to top of list
        }),
        {
          revalidate: false,
          rollbackOnError: true,
        }
      );

      // Make the API call
      await DirectoriesService.createDirectory({
        id: newDirectoryId,
        name,
        type: 'folder',
        parent_directory_id: parentDirectoryId,
      });

      // If this directory has a parent, update the parent's has_children flag
      if (parentDirectoryId) {
        await mutate(
          invalidateCachePattern(['directories']),
          produce((draft?: Directory[]) => {
            if (!draft) {
              return draft;
            }

            const parentIndex = draft.findIndex(dir => dir.id === parentDirectoryId);
            if (parentIndex !== -1) {
              draft[parentIndex].has_children = true;
            }
          }),
          { revalidate: false }
        );
      }

      return newDirectory;
    } catch (error) {
      console.error('Failed to create directory:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const createDirectoryInline = async (parentDirectoryId?: string) => {
    // Generate a unique ID for the new directory
    const newDirectoryId = uuidv4();

    // Create the directory object with empty name (to be filled by user)
    const newDirectory: Directory = {
      id: newDirectoryId,
      name: '', // Empty name - user will fill this in
      type: 'folder',
      has_children: false,
    };

    // Add to cache immediately at the top of the list
    const cacheKey = CACHE_KEYS.directories.withParent(parentDirectoryId);

    await mutate(
      cacheKey,
      produce((draft?: Directory[]) => {
        if (!draft) {
          return [newDirectory];
        }
        draft.unshift(newDirectory); // Add to top
      }),
      { revalidate: false }
    );

    return newDirectoryId;
  };

  const finalizeDirectoryCreation = async (
    id: string,
    name: string,
    parentDirectoryId?: string
  ) => {
    try {
      // Update the cache with the final name
      const cacheKey = CACHE_KEYS.directories.withParent(parentDirectoryId);

      await mutate(
        cacheKey,
        produce((draft?: Directory[]) => {
          if (!draft) {
            return draft;
          }

          const directoryIndex = draft.findIndex(dir => dir.id === id);
          if (directoryIndex !== -1) {
            draft[directoryIndex].name = name;
          }
        }),
        { revalidate: false, rollbackOnError: true }
      );

      // Make the API call
      await DirectoriesService.createDirectory({
        id,
        name,
        type: 'folder',
        parent_directory_id: parentDirectoryId,
      });

      // If this directory has a parent, update the parent's has_children flag
      if (parentDirectoryId) {
        await mutate(
          invalidateCachePattern(['directories']),
          produce((draft?: Directory[]) => {
            if (!draft) {
              return draft;
            }

            const parentIndex = draft.findIndex(dir => dir.id === parentDirectoryId);
            if (parentIndex !== -1) {
              draft[parentIndex].has_children = true;
            }
          }),
          { revalidate: false }
        );
      }
    } catch (error) {
      console.error('Failed to finalize directory creation:', error);
      throw error;
    }
  };

  const removeTemporaryDirectory = async (id: string, parentDirectoryId?: string) => {
    const cacheKey = CACHE_KEYS.directories.withParent(parentDirectoryId);

    await mutate(
      cacheKey,
      produce((draft?: Directory[]) => {
        if (!draft) {
          return draft;
        }

        return draft.filter(dir => dir.id !== id);
      }),
      { revalidate: false }
    );
  };

  return {
    createDirectory,
    createDirectoryInline,
    finalizeDirectoryCreation,
    removeTemporaryDirectory,
    isCreating,
  };
};
