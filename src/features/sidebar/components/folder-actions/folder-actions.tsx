import {
  FilePlus2,
  FileSearch2,
  FolderPlus,
  MessageSquarePlus,
  PackagePlus,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';

import { SidebarMenuButton } from '@shared/components/ui/sidebar';

import { AppRoutes } from '@shared/constants/router';

import { useModalActions } from '@shared/hooks/use-modal-actions';

const FolderActions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openModal } = useModalActions();

  const buttonClassNames =
    'size-8 p-1 rounded-sm flex items-center justify-center cursor-pointer';

  const handleNavigateToHome = () => {
    const params = searchParams.toString();
    const url = params ? `${AppRoutes.Home}?${params}` : AppRoutes.Home;

    navigate(url);
  };

  const handleCreateDirectory = () => {
    // Open modal for creating root directory (no parent)
    openModal('CreateDirectoryModal', {
      parentDirectoryId: undefined,
    });
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
