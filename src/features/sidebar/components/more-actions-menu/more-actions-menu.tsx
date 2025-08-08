import { Loader2Icon, MoreHorizontal } from 'lucide-react';

import { Button } from '@shared/components/ui/button';
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
  onDelete: VoidFunction;
};

const MoreActionsMenu = ({ triggerClassNames, isDeleting, onDelete }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction
          asChild
          className={cn(
            triggerClassNames,
            'right-1 rounded-[4px] top-1/2 -translate-y-1/2 size-6',
            'hover:bg-sidebar'
          )}
        >
          <Button
            variant="ghost"
            size="icon"
          >
            <MoreHorizontal />
          </Button>
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
      >
        <DropdownMenuItem>
          <ThemedSpan>Open in new tab</ThemedSpan>
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
