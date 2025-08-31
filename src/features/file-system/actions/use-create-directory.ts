import { v4 as uuidv4 } from 'uuid';

import { CACHE_KEYS, findCacheKeysByPattern } from '@hooks/cache-keys';

import { DirectoriesService } from '@services/directories/directories-service';

import type { Directory } from '@shared-types/entities';
import { EntityEnum } from '@shared-types/entities';

import { useSWRConfig } from '@lib/swr';

export const useCreateDirectory = () => {
  const { mutate } = useSWRConfig();

  const createTemporaryDirectory = async (parentDirectoryId?: string) => {
    // Generate a unique ID for the new directory
    const newDirectoryId = uuidv4();

    // Create the directory object with empty name (to be filled by user)
    const newDirectory: Directory = {
      id: newDirectoryId,
      name: '', // Empty name - user will fill this in
      type: EntityEnum.Folder,
      has_children: false,
    };

    // Add to cache immediately at the top of the list
    const cacheKey = CACHE_KEYS.directories.byParentId(parentDirectoryId);

    mutate(
      cacheKey,
      (current?: Directory[]): Directory[] => {
        if (!current) return [newDirectory];

        return [newDirectory, ...current]; // Add to top
      },
      {
        revalidate: false,
      }
    );

    return newDirectoryId;
  };

  const finalizeDirectoryCreation = async (
    id: string,
    name: string,
    parentDirectoryId?: string
  ) => {
    const cacheKey = CACHE_KEYS.directories.byParentId(parentDirectoryId);

    await mutate(
      cacheKey,
      async (current?: Directory[]): Promise<Directory[]> => {
        if (!current) return [];

        return current.map(dir => (dir.id === id ? { ...dir, name } : dir));
      },
      { revalidate: false }
    );

    try {
      await DirectoriesService.createDirectory({
        id,
        name,
        type: EntityEnum.Folder,
        parent_directory_id: parentDirectoryId,
      });

      // Create child caches for the new directory chats and folders
      await mutate(CACHE_KEYS.directories.byParentId(id), [], { revalidate: false });
      await mutate(CACHE_KEYS.chats.byParentId(id, undefined), [], {
        revalidate: false,
      });

      // Update parent directory's has_children flag if needed
      if (parentDirectoryId) {
        await mutate(
          findCacheKeysByPattern(['directories']),
          (parentCurrent?: Directory[]): Directory[] => {
            if (!parentCurrent) return [];

            return parentCurrent.map(dir =>
              dir.id === parentDirectoryId ? { ...dir, has_children: true } : dir
            );
          },
          {
            rollbackOnError: true,
            populateCache: true,
            revalidate: false,
          }
        );
      }
    } catch (e) {
      removeTemporaryDirectory(id, parentDirectoryId);
      throw e;
    }
  };

  const removeTemporaryDirectory = async (id: string, parentDirectoryId?: string) => {
    const cacheKey = CACHE_KEYS.directories.byParentId(parentDirectoryId);

    await mutate(
      cacheKey,
      async (current?: Directory[]): Promise<Directory[]> => {
        if (!current) return [];

        return current.filter(dir => dir.id !== id);
      },
      {
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  return {
    createTemporaryDirectory,
    finalizeDirectoryCreation,
    removeTemporaryDirectory,
  };
};
