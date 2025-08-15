import { useLocation, useNavigate } from 'react-router';
import { useSWRConfig } from 'swr';

import { AppRoutes, SearchParams } from '@constants/paths';

import { useChatActions } from '@features/chat/hooks/use-chat-actions';
import { useDeleteChat } from '@features/sidebar/hooks/use-delete-chat';
import { useDeleteDirectory } from '@features/sidebar/hooks/use-delete-directory';
import { useTreeData } from '@features/sidebar/hooks/use-tree-data';

import { useUrlParams } from '@hooks/utils/use-url-params';

import { useInlineEditStore } from '@stores/use-inline-edit-store';

import type { Chat } from '@shared-types/entities';

export const useFolderListLogic = () => {
  // Get root level directories and chats (no parent)
  const { treeNodes, isLoading } = useTreeData();

  const navigate = useNavigate();
  const location = useLocation();
  const { cache } = useSWRConfig();
  const { deleteChat, isDeleting: isDeletingChat } = useDeleteChat();
  const { deleteDirectory, isDeleting: isDeletingDirectory } = useDeleteDirectory();
  const { openChatInSidePanel, openChatInNewTab } = useChatActions();
  const { value: splitChatId, removeValue } = useUrlParams(SearchParams.Split);
  const { startEditing } = useInlineEditStore();

  // Helper function to find a chat across all cached data
  const findChatInAllCaches = (chatId: string): Chat | null => {
    const keys = Array.from(cache.keys());

    for (const key of keys) {
      // Handle both string keys (with @) and array keys
      let isChatsKey = false;
      if (typeof key === 'string' && key.includes('chats')) {
        isChatsKey = true;
      } else if (Array.isArray(key) && key[0] === 'chats') {
        isChatsKey = true;
      }

      if (isChatsKey) {
        const data = cache.get(key);

        // Handle SWR response object (has .data property) vs direct array
        let actualData: unknown = data;
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          Array.isArray((data as { data: unknown }).data)
        ) {
          actualData = (data as { data: Chat[] }).data;
        }

        if (Array.isArray(actualData)) {
          const chat = (actualData as Chat[]).find((item: Chat) => item.id === chatId);
          if (chat) {
            return chat;
          }
        }
      }
    }

    return null;
  };

  const handleDelete = async (nodeId: string) => {
    // First try to find in current treeNodes (for directories and root chats)
    let node = treeNodes.find(n => n.id === nodeId);

    // If not found and it might be a chat, search across all caches
    if (!node) {
      const chatFromCache = findChatInAllCaches(nodeId);
      if (chatFromCache) {
        node = {
          id: chatFromCache.id,
          name: chatFromCache.name,
          type: 'chat' as const,
          hasChildren: chatFromCache.has_children,
          parentDirectoryId: chatFromCache.parent_directory_id,
          originalData: chatFromCache,
        };
      }
    }

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
