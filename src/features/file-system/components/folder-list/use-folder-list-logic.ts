import { useLocation, useNavigate } from 'react-router';

import { AppRoutes, SearchParams } from '@constants/paths';

import { useChatActions } from '@features/chat/hooks/use-chat-actions';
import { useDeleteChat } from '@features/file-system/hooks/use-delete-chat';
import { useDeleteDirectory } from '@features/file-system/hooks/use-delete-directory';
import { useTreeData } from '@features/file-system/hooks/use-tree-data';

import { useUrlParams } from '@hooks/utils/use-url-params';

import { useInlineEditStore } from '@stores/use-inline-edit-store';

import { useFindNodeById } from './use-find-node-by-id';

export const useFolderListLogic = () => {
  // Get root level directories and chats (no parent)
  const { treeNodes, isLoading } = useTreeData();

  const navigate = useNavigate();
  const location = useLocation();
  const { deleteChat, isDeleting: isDeletingChat } = useDeleteChat();
  const { deleteDirectory, isDeleting: isDeletingDirectory } = useDeleteDirectory();
  const { openChatInSidePanel, openChatInNewTab } = useChatActions();
  const { value: splitChatId, removeValue } = useUrlParams(SearchParams.Split);
  const { startEditing } = useInlineEditStore();
  const { findFolderNodeById } = useFindNodeById();

  const handleDelete = async (nodeId: string) => {
    const node = findFolderNodeById(nodeId);

    if (node?.type === 'chat') {
      await deleteChat({
        id: nodeId,
        parentDirectoryId: node.parentDirectoryId ?? undefined,
      });

      if (splitChatId === nodeId) {
        removeValue();
      }

      // Only navigate if we're currently viewing the deleted chat
      const currentChatId = location.pathname.split('/').pop();
      if (currentChatId === nodeId) {
        navigate(AppRoutes.Home);
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
