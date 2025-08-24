import { useNavigate, useParams } from 'react-router';

import { AppRoutes } from '@constants/paths';

import type { TreeNode } from '@features/file-system/hooks/use-tree-data';

export const useTreeNodeLogic = (node: TreeNode) => {
  const navigate = useNavigate();
  const { id: chatId = '' } = useParams();

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
  };
};
