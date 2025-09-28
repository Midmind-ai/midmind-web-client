import { MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import {
  getActionIcon,
  getAvailableActions,
} from '@components/misc/entity-actions/entity-actions-config';
import type { EntityActionHandlers } from '@components/misc/entity-actions/types/entity-action-handlers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { SidebarMenuAction } from '@components/ui/sidebar';
import { ThemedSpan } from '@components/ui/themed-span';
import { ItemTypeEnum } from '@services/items/items-dtos';
import { useMenuStateStore } from '@stores/menu-state.store';
import { cn } from '@utils/cn';

type Props = {
  entityType: ItemTypeEnum;
  handlers: EntityActionHandlers;
  isDeleting?: boolean;
  trigger?: React.ReactNode;
  triggerClassName?: string;
  menuId?: string; // Unique identifier for this menu instance
  setIsHovered: (val: boolean) => void;
};

export const EntityActionsMenu = ({
  entityType,
  handlers,
  isDeleting = false,
  trigger,
  triggerClassName = '',
  menuId,
  setIsHovered,
}: Props) => {
  // Get available actions directly from config
  const actions = useMemo(() => {
    return getAvailableActions(entityType, handlers, isDeleting);
  }, [entityType, handlers, isDeleting]);

  // Generate unique menu ID if not provided
  const uniqueMenuId = useMemo(() => {
    return menuId || `menu-${Math.random().toString(36).substr(2, 9)}`;
  }, [menuId]);

  const { openMenu, closeMenu, isMenuOpen } = useMenuStateStore();
  const isOpen = isMenuOpen(uniqueMenuId);

  // Don't render if no actions available
  if (actions.length === 0) {
    return null;
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      openMenu(uniqueMenuId);
    } else {
      closeMenu(uniqueMenuId);
    }
  };

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DropdownMenuTrigger asChild>
        {trigger || (
          <SidebarMenuAction
            asChild
            className={cn(
              'top-1/2 right-1 size-6 -translate-y-1/2 rounded-[4px] p-1',
              'hover:bg-sidebar',
              triggerClassName
            )}
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <span>
              <MoreHorizontal />
            </span>
          </SidebarMenuAction>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
      >
        {actions.map(action => {
          const Icon = getActionIcon(action, isDeleting);
          const isLoading = action.id === 'delete' && isDeleting;

          return (
            <DropdownMenuItem
              key={action.id}
              onClick={e => {
                e.stopPropagation();
                const handler = handlers[action.action];
                if (handler) {
                  handler();
                }

                setTimeout(() => {
                  setIsHovered(false);
                }, 0);
              }}
            >
              <Icon
                className={cn(
                  isLoading ? 'animate-spin' : 'mr-2 size-4',
                  action.variant === 'destructive' ? 'text-destructive' : ''
                )}
              />
              <ThemedSpan
                className={action.variant === 'destructive' ? 'text-destructive' : ''}
              >
                {action.label}
              </ThemedSpan>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
