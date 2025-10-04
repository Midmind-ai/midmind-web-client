import type { ItemBreadcrumbsResponse } from '../../../services/items/items-dtos';
import { ItemsService } from '../../../services/items/items-service';
import { CACHE_KEYS } from '@hooks/cache-keys';
import { useSWR } from '@lib/swr';
import { useEntityCreationStateStore } from '@stores/entity-creation-state.store';

export const useGetItemBreadcrumbs = (itemId: string) => {
  const isCreating = useEntityCreationStateStore(state => state.isCreating(itemId));

  const { data, isLoading, error } = useSWR(
    // Skip API call if chat is being created
    isCreating ? null : CACHE_KEYS.items.breadcrumbsById(itemId),
    () => ItemsService.getItemBreadcrumbs(itemId)
  );

  return {
    data: data as ItemBreadcrumbsResponse | undefined,
    isLoading: isLoading || isCreating,
    error,
  };
};
