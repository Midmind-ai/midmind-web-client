import { useEffect } from 'react';

import { EntityEnum } from '@shared-types/entities';

import { useFileSystemStore } from '../stores/use-file-system.store';

import { useChatsByParentChat, useChatsByParentDirectory } from './use-chats';
import { useDirectories } from './use-directories';

export const useLoadData = (parentId?: string, parentType?: EntityEnum) => {
  const setNodes = useFileSystemStore(state => state.setNodes);

  const {
    directories,
    isLoading: isLoadingDirectories,
    error: directoriesError,
  } = useDirectories(parentType === EntityEnum.Chat ? null : (parentId ?? null));

  const {
    chats: chatsByDirectory,
    isLoading: isLoadingChatsByDirectory,
    error: chatsByDirectoryError,
  } = useChatsByParentDirectory(
    parentType === EntityEnum.Chat ? null : (parentId ?? null)
  );

  const {
    chats: chatsByParentChat,
    isLoading: isLoadingChatsByParentChat,
    error: chatsByParentChatError,
  } = useChatsByParentChat(parentType === EntityEnum.Chat ? parentId : null);

  useEffect(() => {
    const treeNodes = [
      ...(directories || []),
      ...(chatsByDirectory || []),
      ...(chatsByParentChat || []),
    ];

    setNodes(treeNodes, parentId || 'root');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directories, chatsByDirectory, chatsByParentChat, parentId]);

  return {
    isLoading:
      isLoadingDirectories || isLoadingChatsByDirectory || isLoadingChatsByParentChat,
    error: [directoriesError, chatsByDirectoryError, chatsByParentChatError],
  };
};
