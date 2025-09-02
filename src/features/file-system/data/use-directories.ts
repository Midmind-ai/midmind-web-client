import { useMemo } from 'react';

import { CACHE_KEYS } from '@hooks/cache-keys';

import { DirectoriesService } from '@services/directories/directories-service';

import { EntityEnum, type Directory } from '@shared-types/entities';

import { useSWR } from '@lib/swr';

export const useDirectories = (parentId?: string | null) => {
  const {
    data: directories,
    isLoading,
    error,
    mutate,
  } = useSWR<Directory[]>(
    parentId !== null ? CACHE_KEYS.directories.byParentId(parentId || undefined) : null,
    parentId !== null
      ? () => DirectoriesService.getDirectories(parentId || undefined)
      : null
  );

  const directoriesWithType = useMemo(
    () => directories?.map(item => ({ ...item, type: EntityEnum.Folder })),
    [directories]
  );

  return {
    directories: directoriesWithType,
    isLoading,
    error,
    mutate,
  };
};
