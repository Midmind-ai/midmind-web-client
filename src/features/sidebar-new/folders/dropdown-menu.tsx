import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { Loader2Icon, MoreHorizontal } from 'lucide-react';

import { useSidebarContentLogic } from '@/features/Sidebar/components/SidebarContent/useSidebarContentLogic';
import { SidebarMenuAction } from '@/shared/components/ui/sidebar';
import { AppRoutes, SearchParams } from '@/shared/constants/router';

const openInNewTab = (path: string) => {
  const fullUrl = `${window.location.origin}${path}`;
  window.open(fullUrl, '_blank', 'noopener,noreferrer');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Dropdown({ id, ...props }: { id: string; [key: string]: any }) {
  const { isDeleting, handleDelete } = useSidebarContentLogic();

  const handleOpenInNewTab = () => {
    const path = `${AppRoutes.Chat(id)}?${SearchParams.Model}=gemini-2.0-flash-lite`;
    openInNewTab(path);
  };

  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction className={props.triggerClassNames}>
          <MoreHorizontal />
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
      >
        <DropdownMenuItem onClick={handleOpenInNewTab}>
          <span>Open in new tab</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(id)}>
          {isDeleting && <Loader2Icon className="animate-spin" />}
          <span className="text-destructive">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
