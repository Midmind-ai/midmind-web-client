import useSWR from 'swr';

import { SWRCacheKeys } from '@shared/constants/api';

import { DirectoriesService } from '@shared/services/directories/directories-service';

export const useGetDirectories = (parentId?: string) => {
  const {
    data: directories,
    isLoading,
    error,
    mutate,
  } = useSWR(SWRCacheKeys.GetDirectories(parentId), () =>
    DirectoriesService.getDirectories(parentId)
  );

  return {
    directories,
    isLoading,
    error,
    mutate,
  };
};
