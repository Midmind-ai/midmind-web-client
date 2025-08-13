import { produce } from 'immer';
import { mutate } from 'swr';

import { invalidateCachePattern } from '@hooks/cache-keys';

import { DirectoriesService } from '@services/directories/directories-service';

import type { Directory } from '@shared-types/entities';

type UpdateDirectoryParams = {
  id: string;
  name: string;
};

export const useUpdateDirectory = () => {
  const updateDirectory = async ({ id, name }: UpdateDirectoryParams) => {
    // Optimistically update all directory caches that might contain this directory
    await mutate(
      invalidateCachePattern(['directories']),
      produce((draft?: Directory[]) => {
        if (!draft) {
          return draft;
        }

        const directoryIndex = draft.findIndex(dir => dir.id === id);
        if (directoryIndex !== -1) {
          draft[directoryIndex].name = name;
        }

        return draft;
      }),
      {
        revalidate: false,
        rollbackOnError: true,
      }
    );

    try {
      // Make API call to update on server
      await DirectoriesService.updateDirectory(id, {
        name,
        type: 'folder', // Assuming all directories are folders for now
      });
    } catch (error) {
      console.error('Failed to update directory:', error);
      throw error;
    }
  };

  return {
    updateDirectory,
  };
};
