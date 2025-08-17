import { useSwrGetChatsByParentDirectory } from '@hooks/swr/use-swr-get-chats';
import { useSwrGetDirectories } from '@hooks/swr/use-swr-get-directories';

import type { Chat, Directory } from '@shared-types/entities';

export type TreeNode = {
  id: string;
  name: string;
  type: 'directory' | 'chat' | 'chats';
  hasChildren: boolean;
  parentDirectoryId?: string | null;
  parentChatId?: string | null;
  originalData: Directory | Chat;
};

export const useTreeData = (parentId?: string) => {
  // Fetch directories for this level
  const {
    directories,
    isLoading: isLoadingDirectories,
    error: directoriesError,
  } = useSwrGetDirectories(parentId);

  // Fetch chats for this level
  const {
    chats,
    isLoading: isLoadingChats,
    error: chatsError,
  } = useSwrGetChatsByParentDirectory(parentId);

  // Combine directories and chats into tree nodes
  const treeNodes: TreeNode[] = [
    // Directories first
    ...(directories || []).map(
      (dir: Directory): TreeNode => ({
        id: dir.id,
        name: dir.name,
        type: 'directory',
        hasChildren: dir.has_children,
        parentDirectoryId: parentId || null,
        originalData: dir,
      })
    ),
    // Then chats
    ...(chats || []).map(
      (chat: Chat): TreeNode => ({
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
