import type { Chat, Directory } from '@shared/types/entities';

import { useGetChatsByParentDirectory } from '@features/sidebar/hooks/use-get-chats-by-parent';
import { useGetDirectories } from '@features/sidebar/hooks/use-get-directories';

export type TreeNode = {
  id: string;
  name: string;
  type: 'directory' | 'chat';
  hasChildren: boolean;
  parentDirectoryId?: string | null;
  originalData: Directory | Chat;
};

export const useTreeData = (parentId?: string) => {
  // Fetch directories for this level
  const {
    directories,
    isLoading: isLoadingDirectories,
    error: directoriesError,
  } = useGetDirectories(parentId);

  // Fetch chats for this level
  const {
    chats,
    isLoading: isLoadingChats,
    error: chatsError,
  } = useGetChatsByParentDirectory(parentId);

  // Combine directories and chats into tree nodes
  const treeNodes: TreeNode[] = [
    // Directories first
    ...(directories || []).map(
      (dir): TreeNode => ({
        id: dir.id,
        name: dir.name,
        type: 'directory',
        hasChildren: dir.has_children,
        originalData: dir,
      })
    ),
    // Then chats
    ...(chats || []).map(
      (chat): TreeNode => ({
        id: chat.id,
        name: chat.name,
        type: 'chat',
        hasChildren: chat.has_children,
        parentDirectoryId: chat.parent_directory_id,
        originalData: chat,
      })
    ),
  ];

  return {
    treeNodes,
    isLoading: isLoadingDirectories || isLoadingChats,
    error: directoriesError || chatsError,
  };
};
