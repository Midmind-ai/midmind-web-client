import { produce } from 'immer';
import { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';

import { swrMutationConfig } from '@config/swr';

import { MUTATION_KEYS, findCacheKeysByPattern } from '@hooks/cache-keys';

import { DirectoriesService } from '@services/directories/directories-service';

import type { Directory } from '@shared-types/entities';

type RenameDirectoryParams = {
  id: string;
  name: string;
};

export const useRenameDirectory = () => {
  const renameDirectorySWR = useSWRMutation(
    MUTATION_KEYS.directories.rename,
    async (_, { arg }: { arg: RenameDirectoryParams }) => {
      const { id, name } = arg;

      // Optimistically update all directory caches that might contain this directory
      await mutate(
        findCacheKeysByPattern(['directories']),
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
        }
      );

      // Make API call to update on server
      await DirectoriesService.updateDirectory(id, {
        name,
        type: 'folder', // Assuming all directories are folders for now
      });

      return { id, name };
    },
    swrMutationConfig
  );

  const renameDirectory = async ({ id, name }: RenameDirectoryParams) => {
    return renameDirectorySWR.trigger({ id, name });
  };

  return {
    renameDirectory,
    isMutating: renameDirectorySWR.isMutating,
    error: renameDirectorySWR.error,
  };
};
