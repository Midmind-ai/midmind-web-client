import { produce } from 'immer';
import { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';

import { swrMutationConfig } from '@config/swr';

import { CACHE_KEYS, MUTATION_KEYS, findCacheKeysByPattern } from '@hooks/cache-keys';

import { DirectoriesService } from '@services/directories/directories-service';

import type { Directory } from '@shared-types/entities';

type DeleteDirectoryParams = {
  id: string;
  parentDirectoryId?: string;
};

export const useDeleteDirectory = () => {
  const deleteDirectorySWR = useSWRMutation(
    MUTATION_KEYS.directories.delete,
    async (_, { arg }: { arg: DeleteDirectoryParams }) => {
      const { id, parentDirectoryId } = arg;

      await mutate(
        CACHE_KEYS.directories.withParent(parentDirectoryId),
        produce((draft: Directory[]) => {
          if (!draft) return null;

          return draft.filter(item => item.id !== id);
        }),
        {
          revalidate: false,
        }
      );

      await DirectoriesService.deleteDirectory(id);

      await mutate(findCacheKeysByPattern(['directories', id]), undefined);
      await mutate(findCacheKeysByPattern(['chats', 'directories', id]), undefined);

      return { id, parentDirectoryId };
    },
    swrMutationConfig
  );

  const deleteDirectory = async (id: string, parentDirectoryId?: string) => {
    return deleteDirectorySWR.trigger({ id, parentDirectoryId });
  };

  return {
    deleteDirectory,
    isMutating: deleteDirectorySWR.isMutating,
    error: deleteDirectorySWR.error,
  };
};
