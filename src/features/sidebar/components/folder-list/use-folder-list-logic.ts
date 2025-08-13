import { useLocation, useNavigate } from 'react-router';

import { useDeleteChat } from '@features/chat/hooks/use-delete-chat';
import { useDeleteDirectory } from '@features/sidebar/hooks/use-delete-directory';
import { useTreeData } from '@features/sidebar/hooks/use-tree-data';

import { AppRoutes, SearchParams } from '@/constants/router';
import { useChatActions } from '@/features/chat/hooks/use-chat-actions';
import { useUrlParams } from '@/hooks/utils/use-url-params';
import { useInlineEditStore } from '@/stores/use-inline-edit-store';

export const useFolderListLogic = () => {
  // Get root level directories and chats (no parent)
  const { treeNodes, isLoading } = useTreeData();

  const navigate = useNavigate();
  const location = useLocation();
  const { deleteChat, isLoading: isDeletingChat } = useDeleteChat();
  const { deleteDirectory, isDeleting: isDeletingDirectory } = useDeleteDirectory();
  const { openChatInSidePanel, openChatInNewTab } = useChatActions();
  const { value: splitChatId, removeValue } = useUrlParams(SearchParams.Split);
  const { startEditing } = useInlineEditStore();

  const handleDelete = async (nodeId: string) => {
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
    } else if (node?.type === 'directory') {
      await deleteDirectory({
        id: nodeId,
        parentDirectoryId: node.parentDirectoryId ?? undefined,
      });
    }
  };

  const handleRename = (nodeId: string) => {
    const node = treeNodes.find(n => n.id === nodeId);

    if (node?.type === 'directory' || node?.type === 'chat') {
      startEditing(nodeId);
    }
  };

  return {
    treeNodes,
    isLoading,
    isDeleting: isDeletingChat || isDeletingDirectory,
    handleDelete,
    handleRename,
    openChatInSidePanel,
    openChatInNewTab,
  };
};
