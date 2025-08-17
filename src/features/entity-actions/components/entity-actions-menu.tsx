import { useMemo } from 'react';

import { MoreHorizontal } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { SidebarMenuAction } from '@components/ui/sidebar';
import { ThemedSpan } from '@components/ui/themed-span';

import { useEntityActions } from '@features/entity-actions/hooks/use-entity-actions';
import type { EntityActionHandlers } from '@features/entity-actions/types/entity-action-handlers';

import { useMenuStateStore } from '@stores/use-menu-state-store';

import { cn } from '@utils/cn';

import type { components } from 'generated/api-types';

// Use the breadcrumbs type which has all entity types
type EntityType = components['schemas']['ChatBreadcrumbsDto']['type'];

type Props = {
  entityType: EntityType;
  handlers: EntityActionHandlers;
  isDeleting?: boolean;
  trigger?: React.ReactNode;
  triggerClassName?: string;
  menuId?: string; // Unique identifier for this menu instance
};

export const EntityActionsMenu = ({
  entityType,
  handlers,
  isDeleting = false,
  trigger,
  triggerClassName = '',
  menuId,
}: Props) => {
  const actions = useEntityActions({ entityType, handlers, isDeleting });

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
        {actions.map(action => (
          <DropdownMenuItem
            key={action.key}
            onClick={action.handler}
          >
            {action.loading && action.icon && (
              <action.icon
                className={cn(
                  'animate-spin',
                  action.variant === 'destructive' ? 'text-destructive' : ''
                )}
              />
            )}
            {!action.loading && action.icon && (
              <action.icon
                className={cn(
                  'mr-2 size-4',
                  action.variant === 'destructive' ? 'text-destructive' : ''
                )}
              />
            )}
            <ThemedSpan
              className={action.variant === 'destructive' ? 'text-destructive' : ''}
            >
              {action.label}
            </ThemedSpan>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
