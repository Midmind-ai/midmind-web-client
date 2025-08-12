import { MoreHorizontal } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu';
import { SidebarMenuAction } from '@shared/components/ui/sidebar';
import { ThemedSpan } from '@shared/components/ui/themed-span';

import { cn } from '@shared/utils/cn';

import { useEntityActions } from '../hooks/use-entity-actions';

import type { EntityActionHandlers } from '../types/entity-action-handlers';
import type { components } from 'generated/api-types';

// Use the breadcrumbs type which has all entity types
type EntityType = components['schemas']['ChatBreadcrumbsDto']['type'];

type Props = {
  entityType: EntityType;
  handlers: EntityActionHandlers;
  isDeleting?: boolean;
  trigger?: React.ReactNode;
  triggerClassName?: string;
  onOpenChange?: (open: boolean) => void;
};

export const EntityActionsMenu = ({
  entityType,
  handlers,
  isDeleting = false,
  trigger,
  triggerClassName = '',
  onOpenChange,
}: Props) => {
  const actions = useEntityActions({ entityType, handlers, isDeleting });

  // Don't render if no actions available
  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <SidebarMenuAction
            asChild
            className={cn(
              'top-1/2 right-1 size-6 -translate-y-1/2 rounded-[4px] p-1',
              'hover:bg-sidebar',
              triggerClassName
            )}
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
            {action.loading && action.icon && <action.icon className="animate-spin" />}
            {!action.loading && action.icon && <action.icon className="mr-2 size-4" />}
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
