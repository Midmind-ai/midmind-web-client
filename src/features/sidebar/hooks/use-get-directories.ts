import useSWR from 'swr';

import { CACHE_KEYS } from '@/hooks/cache-keys';
import { DirectoriesService } from '@/services/directories/directories-service';

export const useGetDirectories = (parentId?: string | null) => {
  const {
    data: directories,
    isLoading,
    error,
    mutate,
  } = useSWR(
    parentId !== null ? CACHE_KEYS.directories.withParent(parentId || undefined) : null,
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
