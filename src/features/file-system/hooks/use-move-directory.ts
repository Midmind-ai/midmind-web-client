import { produce } from 'immer';
import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { swrMutationConfig } from '@config/swr';

import { CACHE_KEYS, MUTATION_KEYS } from '@hooks/cache-keys';

import type { Directory } from '@services/directories/directories-dtos';
import { DirectoriesService } from '@services/directories/directories-service';

type MoveDirectoryParams = {
  directoryId: string;
  sourceParentDirectoryId?: string;
  targetParentDirectoryId?: string | null;
};

export const useMoveDirectory = () => {
  const { mutate } = useSWRConfig();

  const moveDirectorySWR = useSWRMutation(
    MUTATION_KEYS.directories.move,
    async (_, { arg }: { arg: MoveDirectoryParams }) => {
      const { directoryId, sourceParentDirectoryId, targetParentDirectoryId } = arg;

      const sourceCacheKey = CACHE_KEYS.directories.withParent(sourceParentDirectoryId);
      const targetCacheKey = CACHE_KEYS.directories.withParent(
        targetParentDirectoryId ?? undefined
      );
      let movedDirectory: Directory | null = null;

      await mutate(
        sourceCacheKey,
        produce((draft?: Directory[]) => {
          if (!draft) return draft;

          const directoryIndex = draft.findIndex(dir => dir.id === directoryId);
          if (directoryIndex !== -1) {
            movedDirectory = { ...draft[directoryIndex] };

            return draft.filter(dir => dir.id !== directoryId);
          }

          return draft;
        }),
        { revalidate: false }
      );

      const shouldUpdateTargetCache = movedDirectory;

      if (shouldUpdateTargetCache) {
        await mutate(
          targetCacheKey,
          produce((draft?: Directory[]) => {
            if (!draft || !movedDirectory) return draft;

            const updatedDirectory = {
              ...movedDirectory,
              parent_id: targetParentDirectoryId,
            };

            return [updatedDirectory, ...draft];
          }),
          { revalidate: false }
        );
      }

      await DirectoriesService.moveDirectory(directoryId, {
        target_parent_id: targetParentDirectoryId ?? null,
      });

      return {
        directoryId,
        sourceParentDirectoryId,
        targetParentDirectoryId,
        movedDirectory,
      };
    },
    swrMutationConfig
  );

  return {
    moveDirectory: moveDirectorySWR.trigger,
    isMutating: moveDirectorySWR.isMutating,
    error: moveDirectorySWR.error,
  };
};
