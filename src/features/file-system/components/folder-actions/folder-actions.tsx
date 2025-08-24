import { FolderPlus, MessageSquarePlus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';

import { SidebarMenuButton } from '@components/ui/sidebar';

import { AppRoutes } from '@constants/paths';

import { useFileSystemActions } from '@features/file-system/use-file-system.actions';

const FolderActions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const controller = useFileSystemActions();
  const { createTemporaryDirectory, startEditing } = controller.actions;

  const buttonClassNames =
    'size-8 p-1 rounded-sm flex items-center justify-center cursor-pointer';

  const handleNavigateToHome = () => {
    const params = searchParams.toString();
    const url = params ? `${AppRoutes.Home}?${params}` : AppRoutes.Home;

    navigate(url);
  };

  const handleCreateDirectory = async () => {
    // Create new directory inline (no parent - root level)
    const newDirectoryId = await createTemporaryDirectory();

    if (newDirectoryId) {
      // Add small delay to ensure component renders before focusing
      setTimeout(() => {
        startEditing(newDirectoryId);
      }, 50);
    }
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
