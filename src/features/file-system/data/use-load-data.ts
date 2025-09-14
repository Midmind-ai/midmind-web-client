import { useEffect } from 'react';
import { useFileSystemStore } from '../stores/file-system.store';
import { EntityEnum } from '@shared-types/entities';

export const useLoadData = (parentId?: string, parentType?: EntityEnum) => {
  const loadData = useFileSystemStore(state => state.loadData);
  const childrenOf = useFileSystemStore(state => state.childrenOf);
  const isLoadingParentIds = useFileSystemStore(state => state.isLoadingParentIds);

  const actualParentId = parentId || 'root';
  const isLoading = isLoadingParentIds.includes(actualParentId);

  // Load data when parentId or parentType changes, but only if not already loaded
  useEffect(() => {
    // Check if we already have children loaded for this parent
    const hasChildren =
      childrenOf[actualParentId] && childrenOf[actualParentId].length >= 0;

    if (!hasChildren) {
      loadData({ parentId: actualParentId, parentType });
    } else {
      // load data without loading state if items already exists
      loadData({ parentId: actualParentId, parentType, silent: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isLoading,
    error: [], // Will add proper error state later
  };
};
