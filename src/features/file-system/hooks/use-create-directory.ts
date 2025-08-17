import { produce } from 'immer';
import { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { v4 as uuidv4 } from 'uuid';

import { swrMutationConfig } from '@config/swr';

import { CACHE_KEYS, MUTATION_KEYS, findCacheKeysByPattern } from '@hooks/cache-keys';

import { DirectoriesService } from '@services/directories/directories-service';

import type { Directory } from '@shared-types/entities';

type FinalizeDirectoryParams = {
  id: string;
  name: string;
  parentDirectoryId?: string;
};

export const useCreateDirectory = () => {
  const createTemporaryDirectory = async (parentDirectoryId?: string) => {
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

  const finalizeDirectorySWR = useSWRMutation(
    MUTATION_KEYS.directories.create,
    async (_, { arg }: { arg: FinalizeDirectoryParams }) => {
      const { id, name, parentDirectoryId } = arg;

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
        { revalidate: false }
      );

      await DirectoriesService.createDirectory({
        id,
        name,
        type: 'folder',
        parent_directory_id: parentDirectoryId,
      });

      await mutate(CACHE_KEYS.directories.withParent(id), [], { revalidate: false });

      await mutate(CACHE_KEYS.chats.withParent(id, undefined), [], { revalidate: false });

      if (parentDirectoryId) {
        await mutate(
          findCacheKeysByPattern(['directories']),
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

      return { id, name, parentDirectoryId };
    },
    swrMutationConfig
  );

  const finalizeDirectoryCreation = async (
    id: string,
    name: string,
    parentDirectoryId?: string
  ) => {
    return finalizeDirectorySWR.trigger({ id, name, parentDirectoryId });
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
    createTemporaryDirectory,
    finalizeDirectoryCreation,
    removeTemporaryDirectory,
    isMutating: finalizeDirectorySWR.isMutating,
    error: finalizeDirectorySWR.error,
  };
};
