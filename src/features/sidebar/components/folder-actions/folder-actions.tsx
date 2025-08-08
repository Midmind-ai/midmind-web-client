import { FilePlus2, FileSearch2, FolderPlus, MessageSquarePlus, PackagePlus } from 'lucide-react';
import { useNavigate } from 'react-router';

import { SidebarMenuButton } from '@shared/components/ui/sidebar';

import { AppRoutes } from '@shared/constants/router';

export default function FolderActions() {
  const navigate = useNavigate();

  const buttonClassNames = 'size-8 p-1 rounded-xs flex items-center justify-center cursor-pointer';

  return (
    <div className="flex justify-between border-b-1 p-1">
      <SidebarMenuButton className={buttonClassNames}>
        <FileSearch2 className="size-5.5! stroke-[1px]" />
      </SidebarMenuButton>
      <div className="flex gap-1">
        <SidebarMenuButton className={buttonClassNames}>
          <FilePlus2 className="size-5.5! stroke-1" />
        </SidebarMenuButton>
        <SidebarMenuButton className={buttonClassNames}>
          <FolderPlus className="size-5.5! stroke-1" />
        </SidebarMenuButton>
        <SidebarMenuButton
          className={buttonClassNames}
          onClick={() => navigate(`${AppRoutes.Home}`)}
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
}
