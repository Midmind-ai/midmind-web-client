import { useMemo } from 'react';

import { EntityEnum, type Chat, type Directory } from '@shared-types/entities';

import { useFileSystemStore } from '../stores/use-file-system.store';

import { useLoadData } from './use-load-data';

export type TreeNode = {
  id: string;
  name: string;
  type: EntityEnum;
  hasChildren: boolean;
  parentId?: string | null;
  parentDirectoryId?: string | null;
  parentChatId?: string | null;
  originalData?: Directory | Chat;
  has_children?: boolean;
  parent_directory_id?: string | null;
  parent_chat_id?: string | null;
};

// Data-only type for pure data fetching
export type FileSystemData = {
  treeNodes: TreeNode[];
  isLoading: boolean;
  error: unknown[];
};

export const useFileSystemData = (
  parentId: string | 'root' = 'root',
  parentType?: EntityEnum
): FileSystemData => {
  const { isLoading, error } = useLoadData(parentId, parentType);

  const { nodes, childrenOf } = useFileSystemStore();

  // Combine directories and chats into tree nodes
  const treeNodes: TreeNode[] = useMemo(() => {
    const childrenNodes = nodes.filter(item =>
      (childrenOf[parentId] || []).some(el => el === item.id)
    );

    const folders = childrenNodes.filter(
      item => item.type === EntityEnum.Folder || item.type === EntityEnum.Mindlet
    );
    const chats = childrenNodes.filter(item => item.type === EntityEnum.Chat) as Chat[];

    return [
      // Directories first (only if parent is not a chat)
      ...(folders || []).map(
        (dir: Directory): TreeNode => ({
          ...dir,
          id: dir.id,
          name: dir.name,
          hasChildren: dir.has_children,
          parentId: parentId,
          originalData: dir,
        })
      ),
      // Then chats
      ...(chats || []).map(
        (chat: Chat): TreeNode => ({
          ...chat,
          id: chat.id,
          name: chat.name,
          hasChildren: chat.has_children,
          parentId: parentId,
          parentDirectoryId: chat.parent_directory_id,
          parentChatId: chat.parent_chat_id,
          originalData: chat,
        })
      ),
    ];
  }, [nodes, childrenOf, parentId]);

  return {
    treeNodes,
    isLoading,
    error,
  };
};
