import {
  useChatsByParentDirectory,
  useChatsByParentChat,
} from '@features/file-system/data/use-chats';
import { useDirectories } from '@features/file-system/data/use-directories';

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

// Data-only type for pure data fetching
export type FileSystemData = {
  treeNodes: TreeNode[];
  isLoading: boolean;
  error: unknown;
};

export const useFileSystemData = (
  parentId?: string | null,
  parentType?: 'directory' | 'chat'
): FileSystemData => {
  // Determine if we're fetching children of a chat or a directory
  const isParentChat = parentType === 'chat';

  // Fetch directories for this level (only if parent is not a chat)
  const {
    directories,
    isLoading: isLoadingDirectories,
    error: directoriesError,
  } = useDirectories(isParentChat ? null : parentId);

  // Fetch chats by parent directory (only if parent is not a chat)
  const {
    chats: chatsByDirectory,
    isLoading: isLoadingChatsByDirectory,
    error: chatsByDirectoryError,
  } = useChatsByParentDirectory(isParentChat ? null : parentId);

  // Fetch chats by parent chat (only if parent is a chat)
  const {
    chats: chatsByParentChat,
    isLoading: isLoadingChatsByParentChat,
    error: chatsByParentChatError,
  } = useChatsByParentChat(isParentChat ? parentId : null);

  // Select the appropriate chats based on parent type
  const chats = isParentChat ? chatsByParentChat : chatsByDirectory;
  const isLoadingChats = isParentChat
    ? isLoadingChatsByParentChat
    : isLoadingChatsByDirectory;
  const chatsError = isParentChat ? chatsByParentChatError : chatsByDirectoryError;

  // Combine directories and chats into tree nodes
  const treeNodes: TreeNode[] = [
    // Directories first (only if parent is not a chat)
    ...(!isParentChat && directories
      ? directories.map(
          (dir: Directory): TreeNode => ({
            id: dir.id,
            name: dir.name,
            type: 'directory',
            hasChildren: dir.has_children,
            parentDirectoryId: parentId || null,
            originalData: dir,
          })
        )
      : []),
    // Then chats
    ...(chats || []).map(
      (chat: Chat): TreeNode => ({
        id: chat.id,
        name: chat.name,
        type: 'chat',
        hasChildren: chat.has_children,
        parentDirectoryId: chat.parent_directory_id,
        parentChatId: chat.parent_chat_id,
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
