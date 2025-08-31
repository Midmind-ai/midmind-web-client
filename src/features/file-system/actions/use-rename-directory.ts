import { useFileSystemStore } from '../stores/use-file-system.store';

type RenameDirectoryParams = {
  id: string;
  name: string;
};

export const useRenameDirectory = () => {
  const renameFolderStore = useFileSystemStore(state => state.renameFolder);

  const renameDirectory = async ({ id, name }: RenameDirectoryParams) => {
    await renameFolderStore(id, name);
  };

  return { renameDirectory };
};
