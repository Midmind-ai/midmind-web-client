import {
  FilePlus2,
  FileSearch2,
  FolderPlus,
  MessageSquarePlus,
  PackagePlus,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';

import { SidebarMenuButton } from '@components/ui/sidebar';

import { AppRoutes } from '@constants/paths';

import { useCreateDirectory } from '@features/sidebar/hooks/use-create-directory';

import { useInlineEditStore } from '@stores/use-inline-edit-store';

const FolderActions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startEditing } = useInlineEditStore();
  const { createTemporaryDirectory } = useCreateDirectory();

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
    <div className="flex justify-between border-b-1 p-1">
      <SidebarMenuButton className={buttonClassNames}>
        <FileSearch2 className="size-5.5! stroke-[1px]" />
      </SidebarMenuButton>
      <div className="flex gap-1">
        <SidebarMenuButton className={buttonClassNames}>
          <FilePlus2 className="size-5.5! stroke-1" />
        </SidebarMenuButton>
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
        <SidebarMenuButton className={buttonClassNames}>
          <PackagePlus
            className="size-5.5! stroke-1"
            color="oklch(62.7% 0.194 149.214)"
          />
        </SidebarMenuButton>
      </div>
    </div>
  );
};

export default FolderActions;
