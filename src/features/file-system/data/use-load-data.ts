import { useEffect } from 'react';

import { EntityEnum } from '@shared-types/entities';

import { useFileSystemStore } from '../stores/use-file-system.store';

import { useChatsByParentChat, useChatsByParentDirectory } from './use-chats';
import { useDirectories } from './use-directories';

export const useLoadData = (parentId?: string, parentType?: EntityEnum) => {
  const { setNodes } = useFileSystemStore();

  const {
    directories,
    isLoading: isLoadingDirectories,
    error: directoriesError,
  } = useDirectories(parentType === EntityEnum.Chat ? null : parentId);

  const {
    chats: chatsByDirectory,
    isLoading: isLoadingChatsByDirectory,
    error: chatsByDirectoryError,
  } = useChatsByParentDirectory(parentType === EntityEnum.Chat ? null : parentId);

  const {
    chats: chatsByParentChat,
    isLoading: isLoadingChatsByParentChat,
    error: chatsByParentChatError,
  } = useChatsByParentChat(parentType === EntityEnum.Chat ? parentId : null);

  useEffect(() => {
    const chats = [...(chatsByDirectory || []), ...(chatsByParentChat || [])].map(
      item => ({ ...item, type: EntityEnum.Chat })
    );

    const treeNodes = [...(directories || []), ...(chats || [])];

    setNodes(treeNodes, parentId || 'root');
  }, [directories, chatsByDirectory, chatsByParentChat, setNodes, parentId]);

  return {
    isLoading:
      isLoadingDirectories || isLoadingChatsByDirectory || isLoadingChatsByParentChat,
    error: [directoriesError, chatsByDirectoryError, chatsByParentChatError],
  };
};
