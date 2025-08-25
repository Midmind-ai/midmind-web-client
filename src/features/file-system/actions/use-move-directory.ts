import { CACHE_KEYS } from '@hooks/cache-keys';

import { DirectoriesService } from '@services/directories/directories-service';

import type { Directory } from '@shared-types/entities';

import { useSWRConfig, unstable_serialize } from '@lib/swr';

type MoveDirectoryParams = {
  directoryId: string;
  sourceParentDirectoryId?: string | null;
  targetParentDirectoryId?: string | null;
};

export const useMoveDirectory = () => {
  const { mutate, cache } = useSWRConfig();

  const moveDirectory = async ({
    directoryId,
    sourceParentDirectoryId = null,
    targetParentDirectoryId,
  }: MoveDirectoryParams) => {
    if (sourceParentDirectoryId === targetParentDirectoryId) return;

    const sourceCacheKey = CACHE_KEYS.directories.byParentId(sourceParentDirectoryId);
    const targetCacheKey = CACHE_KEYS.directories.byParentId(targetParentDirectoryId);

    // Get current cache data for both source and target using unstable_serialize
    const sourceCacheState = cache.get(unstable_serialize(sourceCacheKey));
    const targetCacheState = cache.get(unstable_serialize(targetCacheKey));

    const sourceCacheData = sourceCacheState?.data;
    const targetCacheData = targetCacheState?.data;

    const movedDirectory = sourceCacheData?.find(
      (dir: Directory) => dir.id === directoryId
    );

    if (!movedDirectory) {
      throw new Error('Directory not found in cache');
    }

    // Create updated directory object
    const updatedDirectory = {
      ...movedDirectory,
      parent_id: targetParentDirectoryId,
    };

    // Manual optimistic updates - immediate cache updates
    const updatedSourceCache =
      sourceCacheData?.filter((dir: Directory) => dir.id !== directoryId) || [];
    const updatedTargetCache = targetCacheData
      ? [updatedDirectory, ...targetCacheData]
      : [updatedDirectory];

    // Apply optimistic updates immediately
    await mutate(sourceCacheKey, updatedSourceCache, { revalidate: false });
    await mutate(targetCacheKey, updatedTargetCache, { revalidate: false });

    try {
      // Make API call
      await DirectoriesService.moveDirectory(directoryId, {
        target_parent_id: targetParentDirectoryId ?? null,
      });
    } catch (error) {
      // Manual rollback on error - restore original cache state
      await mutate(sourceCacheKey, sourceCacheData, { revalidate: false });
      await mutate(targetCacheKey, targetCacheData, { revalidate: false });

      // Re-throw error so it gets handled by global error handler
      throw error;
    }
  };

  return { moveDirectory };
};
