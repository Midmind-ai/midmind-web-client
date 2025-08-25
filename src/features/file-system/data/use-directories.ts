import { CACHE_KEYS } from '@hooks/cache-keys';

import { DirectoriesService } from '@services/directories/directories-service';

import { useSWR } from '@lib/swr';

export const useDirectories = (parentId?: string | null) => {
  const {
    data: directories,
    isLoading,
    error,
    mutate,
  } = useSWR(
    parentId !== null ? CACHE_KEYS.directories.byParentId(parentId || undefined) : null,
    parentId !== null
      ? () => DirectoriesService.getDirectories(parentId || undefined)
      : null
  );

  return {
    directories,
    isLoading,
    error,
    mutate,
  };
};
