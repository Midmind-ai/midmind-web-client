import { useFileSystemStore } from '../stores/use-file-system.store';

export const useRenameChat = () => {
  const renameChat = useFileSystemStore(state => state.renameChat);

  return { renameChat };
};
