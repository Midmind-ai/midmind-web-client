import useSWR from 'swr';

import { SWRCacheKeys } from '@shared/constants/api';

import { DirectoriesService } from '@shared/services/directories/directories-service';

export const useGetDirectories = (parentId?: string | null) => {
  const {
    data: directories,
    isLoading,
    error,
    mutate,
  } = useSWR(
    parentId !== null ? SWRCacheKeys.GetDirectories(parentId || undefined) : null,
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
