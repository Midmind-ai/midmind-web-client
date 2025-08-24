import { useNavigate, useParams } from 'react-router';
import { mutate } from 'swr';

import { AppRoutes } from '@constants/paths';

import type { TreeNode } from '@features/file-system/hooks/use-tree-data';

import { CACHE_KEYS } from '@hooks/cache-keys';
import {
  useSwrGetChatsByParentChat,
  useSwrGetChatsByParentDirectory,
} from '@hooks/swr/use-swr-get-chats';
import { useSwrGetDirectories } from '@hooks/swr/use-swr-get-directories';

import type { Chat, Directory } from '@shared-types/entities';

export const useTreeNodeLogic = (node: TreeNode, isOpen: boolean) => {
  const navigate = useNavigate();
  const { id: chatId = '' } = useParams();

  // Fetch for all expanded directories, not just those with hasChildren
  // This ensures empty directories get cache entries
  const shouldFetchDirectory = isOpen && node.type === 'directory';
  const shouldFetchChat = isOpen && node.type === 'chat' && node.hasChildren;

  // For directories: fetch directories and chats with parent_directory_id
  // Pass null to disable SWR when we don't want to fetch
  const { directories, isLoading: isLoadingDirectories } = useSwrGetDirectories(
    shouldFetchDirectory ? node.id : null
  );

  const { chats: chatsFromDirectory, isLoading: isLoadingChatsFromDirectory } =
    useSwrGetChatsByParentDirectory(shouldFetchDirectory ? node.id : null);

  // For chats with children: fetch sub-chats with parent_chat_id
  const { chats: chatsFromChat, isLoading: isLoadingChatsFromChat } =
    useSwrGetChatsByParentChat(shouldFetchChat ? node.id : null);

  // Combine child nodes based on node type
  const childNodes: TreeNode[] = [];

  if (shouldFetchDirectory) {
    // Add directories first
    childNodes.push(
      ...(directories || []).map(
        (dir: Directory): TreeNode => ({
          id: dir.id,
          name: dir.name,
          type: 'directory',
          hasChildren: dir.has_children,
          // Set the parent directory ID to the current node's ID
          parentDirectoryId: node.id,
          originalData: dir,
        })
      )
    );

    // Initialize cache for each loaded directory if it doesn't exist
    // This ensures every directory has a cache entry for future moves
    directories?.forEach((dir: Directory) => {
      // Initialize empty directories cache for this directory
      mutate(
        CACHE_KEYS.directories.byParentId(dir.id),
        (currentData: Directory[] | undefined) => {
          // Only initialize if cache doesn't exist (undefined)
          // If it already exists (even as empty array), keep it
          return currentData ?? [];
        },
        { revalidate: false }
      );

      // Also initialize empty chats cache for this directory
      mutate(
        CACHE_KEYS.chats.byParentId(dir.id, undefined),
        (currentData: Chat[] | undefined) => {
          return currentData ?? [];
        },
        { revalidate: false }
      );
    });

    // Add chats
    childNodes.push(
      ...(chatsFromDirectory || []).map(
        (chat: Chat): TreeNode => ({
          id: chat.id,
          name: chat.name,
          type: 'chat',
          hasChildren: chat.has_children,
          // Set the parent directory ID to the current node's ID
          parentDirectoryId: node.id,
          originalData: chat,
        })
      )
    );
  } else if (shouldFetchChat) {
    // Add sub-chats only
    childNodes.push(
      ...(chatsFromChat || []).map(
        (chat: Chat): TreeNode => ({
          id: chat.id,
          name: chat.name,
          type: 'chat',
          hasChildren: chat.has_children,
          // For chat children, keep the parent directory ID from the parent chat
          parentDirectoryId: node.parentDirectoryId,
          originalData: chat,
        })
      )
    );
  }

  const isLoadingChildren =
    (shouldFetchDirectory && (isLoadingDirectories || isLoadingChatsFromDirectory)) ||
    (shouldFetchChat && isLoadingChatsFromChat);

  const isActive = node.type === 'chat' && node.id === chatId;

  const handleClick = () => {
    if (node.type === 'chat') {
      // Navigate to chat for all chat nodes
      const currentSearch = window.location.search;
      navigate(`${AppRoutes.Chat(node.id)}${currentSearch}`);
    }
    // For directories, clicking does nothing (only chevron expands/collapses)
  };

  return {
    isActive,
    handleClick,
    childNodes,
    isLoadingChildren,
  };
};
