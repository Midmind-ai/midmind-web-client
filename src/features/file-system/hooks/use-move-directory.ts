/* eslint-disable no-console */
import { produce } from 'immer';
import { useSWRConfig } from 'swr';

import { CACHE_KEYS } from '@hooks/cache-keys';
import { useCacheUtils } from '@hooks/use-cache-utils';

import type { Directory } from '@services/directories/directories-dtos';
import { DirectoriesService } from '@services/directories/directories-service';

type MoveDirectoryParams = {
  directoryId: string;
  sourceParentDirectoryId?: string;
  targetParentDirectoryId?: string | null;
};

export const useMoveDirectory = () => {
  const { mutate } = useSWRConfig();
  const { cacheExists, cache } = useCacheUtils();

  const moveDirectory = async ({
    directoryId,
    sourceParentDirectoryId,
    targetParentDirectoryId,
  }: MoveDirectoryParams) => {
    // Get cache keys for source and target
    const sourceCacheKey = CACHE_KEYS.directories.withParent(sourceParentDirectoryId);
    const targetCacheKey = CACHE_KEYS.directories.withParent(
      targetParentDirectoryId ?? undefined
    );

    // Debug logging
    console.log('🔧 useMoveDirectory DEBUG:', {
      directoryId,
      sourceParentDirectoryId,
      targetParentDirectoryId,
      sourceCacheKey,
      targetCacheKey,
    });

    // Check if target cache exists
    const targetCacheExists = cacheExists(targetCacheKey);
    console.log('🔧 Target cache exists:', targetCacheExists);

    // Log current target cache content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentTargetCache = cache.get(targetCacheKey as any);
    console.log('🔧 Current target cache content:', currentTargetCache);

    // Log all cache keys to understand the structure
    const allCacheKeys = Array.from(cache.keys());
    console.log('🔧 All cache keys:', allCacheKeys);

    // Filter for directory-related keys
    const directoryCacheKeys = allCacheKeys.filter(
      key => Array.isArray(key) && key[0] === 'directories'
    );
    console.log('🔧 Directory cache keys:', directoryCacheKeys);

    // Find the directory to move first
    let movedDirectory: Directory | null = null;

    try {
      // Step 1: Remove from source cache optimistically
      await mutate(
        sourceCacheKey,
        produce((draft?: Directory[]) => {
          if (!draft) {
            return draft;
          }

          const directoryIndex = draft.findIndex(dir => dir.id === directoryId);
          if (directoryIndex !== -1) {
            movedDirectory = { ...draft[directoryIndex] };

            return draft.filter(dir => dir.id !== directoryId);
          }

          return draft;
        }),
        {
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        }
      );

      // Step 2: Add to target cache optimistically (only if cache exists)
      const shouldUpdateTargetCache = movedDirectory && cacheExists(targetCacheKey);
      console.log('🔧 Should update target cache:', shouldUpdateTargetCache, {
        hasMovedDirectory: !!movedDirectory,
        targetCacheExists: cacheExists(targetCacheKey),
      });

      if (shouldUpdateTargetCache) {
        console.log('🔧 Running target cache update...');
        await mutate(
          targetCacheKey,
          produce((draft?: Directory[]) => {
            console.log('🔧 Target cache draft before update:', draft);
            if (!draft || !movedDirectory) {
              console.log('🔧 Skipping update - no draft or no moved directory');

              return draft;
            }

            const updatedDirectory = {
              ...movedDirectory,
              parent_id: targetParentDirectoryId,
            };

            console.log('🔧 Adding directory to target cache:', updatedDirectory);
            const newDraft = [updatedDirectory, ...draft];
            console.log('🔧 Target cache draft after update:', newDraft);

            return newDraft;
          }),
          {
            rollbackOnError: true,
            populateCache: true,
            revalidate: false,
          }
        );
        console.log('🔧 Target cache update completed');
      } else {
        console.log('🔧 Skipping target cache update');
      }

      // Step 3: Make API call
      await DirectoriesService.moveDirectory(directoryId, {
        target_parent_id: targetParentDirectoryId,
      });

      // Step 4: Revalidate both caches to ensure consistency
      mutate(sourceCacheKey);
      mutate(targetCacheKey);
    } catch (error) {
      console.error('Failed to move directory:', error);
      // Rollback will happen automatically due to rollbackOnError: true
      throw error;
    }
  };

  return {
    moveDirectory,
  };
};
