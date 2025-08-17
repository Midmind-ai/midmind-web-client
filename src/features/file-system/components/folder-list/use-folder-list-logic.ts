// import { useLocation, useNavigate } from 'react-router';

// import { AppRoutes, SearchParams } from '@constants/paths';

import { useChatActions } from '@features/chat/hooks/use-chat-actions';
import { useDeleteChat } from '@features/file-system/hooks/use-delete-chat';
import { useDeleteDirectory } from '@features/file-system/hooks/use-delete-directory';
import { useTreeData } from '@features/file-system/hooks/use-tree-data';

// import { useUrlParams } from '@hooks/utils/use-url-params';

import { useInlineEditStore } from '@stores/use-inline-edit-store';

export const useFolderListLogic = () => {
  // Get root level directories and chats (no parent)
  const { treeNodes, isLoading } = useTreeData();

  // TODO: navigate user in case when user located in the delete directory or chat
  // const navigate = useNavigate();
  // const location = useLocation();
  // const { value: splitChatId, removeValue } = useUrlParams(SearchParams.Split);

  const { deleteChat } = useDeleteChat();
  const { deleteDirectory } = useDeleteDirectory();
  const { openChatInSidePanel, openChatInNewTab } = useChatActions();
  const { startEditing } = useInlineEditStore();

  const startRename = (nodeId: string) => {
    const node = treeNodes.find(n => n.id === nodeId);

    if (node?.type === 'directory' || node?.type === 'chat') {
      startEditing(nodeId);
    }
  };

  return {
    isLoading,
    treeNodes,
    deleteChat,
    deleteDirectory,
    startRename,
    openChatInSidePanel,
    openChatInNewTab,
  };
};
