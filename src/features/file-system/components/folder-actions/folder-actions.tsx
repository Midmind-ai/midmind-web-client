import { FolderPlus, MessageSquarePlus } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { SidebarMenuButton } from '@components/ui/sidebar';
import { AppRoutes } from '@constants/paths';
import { useFileSystemStore } from '@features/file-system/stores/file-system.store';
import { navigate } from '@hooks/use-navigation';

const FolderActions = () => {
  const [searchParams] = useSearchParams();

  // Store actions (inline editing handled inside store)
  const createTemporaryFolder = useFileSystemStore(state => state.createTemporaryFolder);

  const buttonClassNames =
    'size-8 p-1 rounded-sm flex items-center justify-center cursor-pointer';

  const handleNavigateToHome = () => {
    const params = searchParams.toString();
    const url = params ? `${AppRoutes.Home}?${params}` : AppRoutes.Home;

    navigate(url);
  };

  const handleCreateDirectory = () => {
    // Create new directory inline (no parent - root level)
    // Store automatically starts inline editing
    createTemporaryFolder();
  };

  return (
    <div className="flex justify-end border-b-1 p-1">
      <div className="flex gap-1">
        <SidebarMenuButton
          className={buttonClassNames}
          onClick={handleCreateDirectory}
        >
          <FolderPlus className="size-5.5! stroke-1" />
        </SidebarMenuButton>
        <SidebarMenuButton
          className={buttonClassNames}
          onClick={handleNavigateToHome}
        >
          <MessageSquarePlus className="size-5.5! stroke-1" />
        </SidebarMenuButton>
      </div>
    </div>
  );
};

export default FolderActions;
