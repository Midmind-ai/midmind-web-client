import { useNavigate, useParams } from 'react-router';

import {
  useGetChatsByParentChat,
  useGetChatsByParentDirectory,
} from '@features/sidebar/hooks/use-get-chats-by-parent';
import { useGetDirectories } from '@features/sidebar/hooks/use-get-directories';
import type { TreeNode } from '@features/sidebar/hooks/use-tree-data';

import { AppRoutes } from '@/constants/paths';
import type { Chat, Directory } from '@/types/entities';

export const useTreeNodeLogic = (node: TreeNode, isOpen: boolean) => {
  const navigate = useNavigate();
  const { id: chatId = '' } = useParams();

  const shouldFetch = isOpen && node.hasChildren;

  // For directories: fetch directories and chats with parent_directory_id
  // Pass null to disable SWR when we don't want to fetch
  const { directories, isLoading: isLoadingDirectories } = useGetDirectories(
    shouldFetch && node.type === 'directory' ? node.id : null
  );

  const { chats: chatsFromDirectory, isLoading: isLoadingChatsFromDirectory } =
    useGetChatsByParentDirectory(
      shouldFetch && node.type === 'directory' ? node.id : null
    );

  // For chats with children: fetch sub-chats with parent_chat_id
  const { chats: chatsFromChat, isLoading: isLoadingChatsFromChat } =
    useGetChatsByParentChat(shouldFetch && node.type === 'chat' ? node.id : null);

  // Combine child nodes based on node type
  const childNodes: TreeNode[] = [];

  if (shouldFetch && node.type === 'directory') {
    // Add directories first
    childNodes.push(
      ...(directories || []).map(
        (dir: Directory): TreeNode => ({
          id: dir.id,
          name: dir.name,
          type: 'directory',
          hasChildren: dir.has_children,
          originalData: dir,
        })
      )
    );

    // Add chats
    childNodes.push(
      ...(chatsFromDirectory || []).map(
        (chat: Chat): TreeNode => ({
          id: chat.id,
          name: chat.name,
          type: 'chat',
          hasChildren: chat.has_children,
          parentDirectoryId: chat.parent_directory_id,
          originalData: chat,
        })
      )
    );
  } else if (shouldFetch && node.type === 'chat') {
    // Add sub-chats only
    childNodes.push(
      ...(chatsFromChat || []).map(
        (chat: Chat): TreeNode => ({
          id: chat.id,
          name: chat.name,
          type: 'chat',
          hasChildren: chat.has_children,
          parentDirectoryId: chat.parent_directory_id,
          originalData: chat,
        })
      )
    );
  }

  const isLoadingChildren =
    shouldFetch &&
    (isLoadingDirectories || isLoadingChatsFromDirectory || isLoadingChatsFromChat);

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
