import { useEffect } from 'react';
import { useFileSystemStore } from '../stores/file-system.store';
import { EntityEnum } from '@shared-types/entities';

export const useLoadData = (parentId?: string, parentType?: EntityEnum) => {
  const loadData = useFileSystemStore(state => state.loadData);
  const isParentLoading = useFileSystemStore(state => state.isParentLoading);
  const childrenOf = useFileSystemStore(state => state.childrenOf);

  const actualParentId = parentId || 'root';

  // Load data when parentId or parentType changes, but only if not already loaded
  useEffect(() => {
    // Check if we already have children loaded for this parent
    const hasChildren =
      childrenOf[actualParentId] && childrenOf[actualParentId].length >= 0;

    // Only load if we don't have data for this parent yet
    if (!hasChildren && !isParentLoading(actualParentId)) {
      loadData(actualParentId, parentType);
    }
  }, [actualParentId, parentType, loadData, isParentLoading, childrenOf]);

  return {
    isLoading: isParentLoading(actualParentId),
    error: [], // Will add proper error state later
  };
};
