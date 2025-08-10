import { Loader2Icon, MoreHorizontal } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu';
import { SidebarMenuAction } from '@shared/components/ui/sidebar';
import { ThemedSpan } from '@shared/components/ui/themed-span';

import { cn } from '@shared/utils/cn';

type Props = {
  triggerClassNames: string;
  isDeleting: boolean;
  onDelete: (e: React.MouseEvent<HTMLElement>) => void;
  onOpenInSidePanel: (e: React.MouseEvent<HTMLElement>) => void;
  onOpenInNewTab: (e: React.MouseEvent<HTMLElement>) => void;
  onOpenChange?: (open: boolean) => void;
};

const MoreActionsMenu = ({
  triggerClassNames,
  isDeleting,
  onDelete,
  onOpenInSidePanel,
  onOpenInNewTab,
  onOpenChange,
}: Props) => {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction
          asChild
          className={cn(
            triggerClassNames,
            'top-1/2 right-1 size-6 -translate-y-1/2 rounded-[4px] p-1',
            'hover:bg-sidebar'
          )}
        >
          <span>
            <MoreHorizontal />
          </span>
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
      >
        <DropdownMenuItem onClick={onOpenInNewTab}>
          <ThemedSpan>Open in new tab</ThemedSpan>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenInSidePanel}>
          <ThemedSpan>Open in side panel</ThemedSpan>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete}>
          {isDeleting && <Loader2Icon className="animate-spin" />}
          <ThemedSpan className="text-destructive">Delete</ThemedSpan>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MoreActionsMenu;
