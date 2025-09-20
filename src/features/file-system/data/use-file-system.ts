import { useState, useEffect, useMemo } from 'react';
import { useFileSystemStore } from '../stores/file-system.store';
import type { Item, ItemType } from '@services/items/items-dtos';
import { EntityEnum } from '@shared-types/entities';

// TreeNode type (same as before)
export type TreeNode = {
  id: string;
  name: string;
  type: EntityEnum | ItemType;
  hasChildren: boolean;
  parentId?: string | null;

  // Legacy properties for backward compatibility
  parentDirectoryId?: string | null;
  parentChatId?: string | null;
  originalData?: unknown;
  has_children?: boolean;
  parent_directory_id?: string | null;
  parent_chat_id?: string | null;

  // New item properties
  parent_id?: string | null;
  root_item_id?: string | null;
  user_id?: string;
  created_at?: string;
  updated_at?: string | null;
  payload?: Record<string, unknown>;
};

// Helper function to convert Item to TreeNode (same as before)
export const itemToTreeNode = (item: Item, parentId?: string | null): TreeNode => ({
  id: item.id,
  name: item.payload?.name || `Untitled ${item.type}`,
  type: item.type as EntityEnum,
  hasChildren: false, // Will be determined by server data
  parentId: parentId || item.parent_id,
  parent_id: item.parent_id,
  root_item_id: item.root_item_id,
  user_id: item.user_id,
  created_at: item.created_at,
  updated_at: item.updated_at,
  payload: item.payload,
  originalData: item,
});

// Helper function to convert TreeNode to Item (same as before)
export const treeNodeToItem = (node: TreeNode): Partial<Item> => ({
  id: node.id,
  type: node.type as ItemType,
  parent_id: node.parent_id || node.parentId,
  payload: {
    name: node.name,
    ...((node.payload as Record<string, unknown>) || {}),
  } as unknown as Item['payload'],
});

// Data-only type for the hook result
export type FileSystemData = {
  treeNodes: TreeNode[];
  isLoading: boolean;
  error: Error | null;
};

// Empty array constant to avoid creating new references
const EMPTY_ARRAY: string[] = [];

/**
 * Consolidated hook that handles both data loading and state management
 * Replaces useLoadData + useFileSystemData with simpler, more reliable logic
 */
export const useFileSystem = (parentId: string | null = null): FileSystemData => {
  // Local loading state (no more complex store state)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get data from store
  const nodes = useFileSystemStore(state => state.nodes);
  const actualParentId = parentId || 'root';
  const childrenIds = useFileSystemStore(
    state => state.childrenOf[actualParentId] || EMPTY_ARRAY
  );
  const hasLoadAttempted = useFileSystemStore(state => state.hasLoadAttempted);
  const loadData = useFileSystemStore(state => state.loadData);

  // Handle data loading
  useEffect(() => {
    const hasAttempted = hasLoadAttempted(actualParentId);

    if (!hasAttempted && !isLoading) {
      setIsLoading(true);
      setError(null);

      loadData(actualParentId)
        .then(() => {
          setError(null);
        })
        .catch((err: Error) => {
          console.error('Failed to load data for', actualParentId, err);
          setError(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [actualParentId, loadData, hasLoadAttempted, isLoading]);

  // Convert nodes to tree nodes
  const treeNodes: TreeNode[] = useMemo(() => {
    const childrenNodes = nodes.filter(item => childrenIds.some(el => el === item.id));

    return childrenNodes.map((node): TreeNode => {
      // Check if this is a new Item structure (check for payload first, then has specific Item properties)
      if (
        'payload' in node &&
        node.payload &&
        ('user_id' in node || 'created_at' in node)
      ) {
        return itemToTreeNode(node as Item, parentId);
      }

      // Fallback for any other structure
      return {
        id: node.id,
        name: 'Untitled',
        type: node.type as EntityEnum,
        hasChildren: false,
        parentId: parentId,
        originalData: node,
      };
    });
  }, [nodes, childrenIds, parentId]);

  return {
    treeNodes,
    isLoading,
    error,
  };
};

// Backward compatibility exports
export { useFileSystem as useFileSystemData };
