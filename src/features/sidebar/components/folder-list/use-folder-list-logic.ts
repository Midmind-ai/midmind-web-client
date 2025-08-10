import { useLocation, useNavigate } from 'react-router';

import { AppRoutes, SearchParams } from '@shared/constants/router';

import { useUrlParams } from '@shared/hooks/use-url-params';

import { useDeleteChat } from '@features/chat/hooks/use-delete-chat';
import { useTreeData } from '@features/sidebar/hooks/use-tree-data';

import { useChatActions } from '@/features/chat/hooks/use-chat-actions';

export const useFolderListLogic = () => {
  // Get root level directories and chats (no parent)
  const { treeNodes, isLoading } = useTreeData();

  const navigate = useNavigate();
  const location = useLocation();
  const { deleteChat, isLoading: isDeleting } = useDeleteChat();
  const { openChatInSidePanel, openChatInNewTab } = useChatActions();
  const { value: splitChatId, removeValue } = useUrlParams(SearchParams.Split);

  const handleDelete = async (nodeId: string) => {
    // For now, only handle chat deletion
    // TODO: Add directory deletion when API supports it
    const node = treeNodes.find(n => n.id === nodeId);
    if (node?.type === 'chat') {
      await deleteChat(nodeId);

      if (splitChatId === nodeId) {
        removeValue();
      }

      const currentChatId = location.pathname.split('/').pop();
      const remainingChats = treeNodes.filter(n => n.type === 'chat' && n.id !== nodeId);

      if (currentChatId === nodeId) {
        if (remainingChats.length > 0) {
          const currentSearch = location.search;
          navigate(
            `${AppRoutes.Chat(remainingChats[remainingChats.length - 1].id)}${currentSearch}`
          );
        } else {
          navigate(AppRoutes.Home);
        }
      }
    }
  };

  return {
    treeNodes,
    isLoading,
    isDeleting,
    handleDelete,
    openChatInSidePanel,
    openChatInNewTab,
  };
};
