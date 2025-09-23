import { useEffect } from 'react';
import { useFileSystemStore } from '../stores/file-system.store';
import type { Item } from '@services/items/items-dtos';

// Data-only type for the hook result
export type FileSystemData = {
  items: Item[];
  isLoading: boolean;
  error: Error | null;
};

const EMPTY_ARRAY: Item[] = [];

/**
 * Consolidated hook that handles both data loading and state management
 * Replaces useLoadData + useFileSystemData with simpler, more reliable logic
 */
export const useFileSystem = (parentId: string | null = null): FileSystemData => {
  // Get data from store
  const actualParentId = parentId || 'root';

  const itemsByParentId = useFileSystemStore(state => state.itemsByParentId);
  const isLoadingParentIds = useFileSystemStore(state => state.isLoadingParentIds);
  const loadErrors = useFileSystemStore(state => state.loadErrors);

  // Derive values from selected state
  const items = itemsByParentId[actualParentId] || EMPTY_ARRAY;
  const isCurrentlyLoading = isLoadingParentIds.has(actualParentId);
  const error = loadErrors[actualParentId] || null;

  // Load data when needed - this should be in a separate effect to avoid render loops
  useEffect(() => {
    const store = useFileSystemStore.getState();
    const hasAttempted = store.hasLoadAttempted(actualParentId);
    const isLoading = store.isParentLoading(actualParentId);

    if (!hasAttempted && !isLoading) {
      store.loadItems(actualParentId === 'root' ? null : actualParentId);
    }
  }, [actualParentId]);

  return {
    items,
    isLoading: isCurrentlyLoading,
    error,
  };
};

// Backward compatibility exports
export { useFileSystem as useFileSystemData };
