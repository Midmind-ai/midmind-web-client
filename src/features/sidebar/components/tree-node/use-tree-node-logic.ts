import { useNavigate, useParams } from 'react-router';

import { AppRoutes } from '@shared/constants/router';

import type { TreeNode } from '@features/sidebar/hooks/use-tree-data';
import { useTreeData } from '@features/sidebar/hooks/use-tree-data';

export const useTreeNodeLogic = (node: TreeNode, isOpen: boolean) => {
  const navigate = useNavigate();
  const { id: chatId = '' } = useParams();

  // Determine what parent ID to use for fetching children
  // For directories: use directory ID
  // For chats with children: use chat ID as parent_directory_id
  const parentIdForChildren =
    node.type === 'directory'
      ? node.id
      : node.type === 'chat' && node.hasChildren
        ? node.id
        : undefined;

  // Only fetch children when expanded and has children
  const { treeNodes: childNodes, isLoading: isLoadingChildren } = useTreeData(
    isOpen && node.hasChildren ? parentIdForChildren : undefined
  );

  const isActive = node.type === 'chat' && node.id === chatId;

  const handleClick = () => {
    if (node.type === 'chat' && !node.hasChildren) {
      // Navigate to chat only if it doesn't have children
      const currentSearch = window.location.search;
      navigate(`${AppRoutes.Chat(node.id)}${currentSearch}`);
    }
    // For directories or chats with children, clicking just expands/collapses
  };

  return {
    isActive,
    handleClick,
    childNodes: isOpen ? childNodes : [],
    isLoadingChildren: isOpen && isLoadingChildren,
  };
};
