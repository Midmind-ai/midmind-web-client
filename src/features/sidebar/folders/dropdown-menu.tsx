import { Loader2Icon, MoreHorizontal } from 'lucide-react';

import { useSidebarContentLogic } from '@/features/sidebar/use-sidebar-content-logic';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { SidebarMenuAction } from '@/shared/components/ui/sidebar';
import { AppRoutes, SearchParams } from '@/shared/constants/router';
import { cn } from '@/shared/utils/cn';

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
        <SidebarMenuAction
          asChild
          className={cn(
            props.triggerClassNames,
            'right-1 rounded-[4px] top-1/2 -translate-y-1/2 size-6',
            'hover:bg-sidebar'
          )}
        >
          <button>
            <MoreHorizontal />
          </button>
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
