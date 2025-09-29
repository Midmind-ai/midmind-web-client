import { Folder, Library, MessageSquare, NotebookText, Wrench } from 'lucide-react';
// import { useSearchParams } from 'react-router';
import { SidebarMenuButton } from '@components/ui/sidebar';
import { useFileSystemStore } from '@features/file-system/stores/file-system.store';
// import { AppRoutes } from '@constants/paths';
// import { navigate } from '@hooks/use-navigation';
import { ItemTypeEnum } from '@services/items/items-dtos';

const FolderActions = () => {
  // const [searchParams] = useSearchParams();

  // Store actions (inline editing handled inside store)
  const createTemporaryItem = useFileSystemStore(state => state.createTemporaryItem);

  const buttonClassNames =
    'size-8 p-1 rounded-sm flex items-center justify-center cursor-pointer';

  // const handleNavigateToHome = () => {
  //   const params = searchParams.toString();
  //   const url = params ? `${AppRoutes.Home}?${params}` : AppRoutes.Home;

  //   navigate(url);
  // };

  const handleCreateChat = () => {
    createTemporaryItem(ItemTypeEnum.Chat);
  };

  const handleCreateDirectory = () => {
    // Create new directory inline (no parent - root level)
    // Store automatically starts inline editing
    createTemporaryItem(ItemTypeEnum.Folder);
  };

  const handleCreateProject = () => {
    // Create new directory inline (no parent - root level)
    // Store automatically starts inline editing
    createTemporaryItem(ItemTypeEnum.Project);
  };

  const handleCreateNote = () => {
    // Create new note inline (no parent - root level)
    // Store automatically starts inline editing
    createTemporaryItem(ItemTypeEnum.Note);
  };

  const handleCreatePrompt = () => {
    // Create new prompt inline (no parent - root level)
    // Store automatically starts inline editing
    createTemporaryItem(ItemTypeEnum.Prompt);
  };

  return (
    <div className="flex justify-end border-b-1 p-1">
      <div className="flex gap-1">
        <SidebarMenuButton
          className={buttonClassNames}
          onClick={handleCreateProject}
        >
          <Library className="size-5.5! stroke-1" />
        </SidebarMenuButton>
        <SidebarMenuButton
          className={buttonClassNames}
          onClick={handleCreateDirectory}
        >
          <Folder className="size-5.5! stroke-1" />
        </SidebarMenuButton>
        <SidebarMenuButton
          className={buttonClassNames}
          onClick={handleCreateNote}
        >
          <NotebookText className="size-5.5! stroke-1" />
        </SidebarMenuButton>
        <SidebarMenuButton
          className={buttonClassNames}
          onClick={handleCreatePrompt}
        >
          <Wrench className="size-5.5! stroke-1" />
        </SidebarMenuButton>
        <SidebarMenuButton
          className={buttonClassNames}
          onClick={handleCreateChat}
        >
          <MessageSquare className="size-5.5! stroke-1" />
        </SidebarMenuButton>
      </div>
    </div>
  );
};

export default FolderActions;
