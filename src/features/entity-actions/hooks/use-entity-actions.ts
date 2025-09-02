import { useMemo } from 'react';

import type { ActionConfig } from '@features/entity-actions/types/action-config';
import type { EntityActionHandlers } from '@features/entity-actions/types/entity-action-handlers';
import {
  createFolderActions,
  createChatActions,
  createBranchActions,
  createMindletActions,
} from '@features/entity-actions/utils/action-creators';

import type { components } from 'generated/api-types';

// Use the breadcrumbs type which has all entity types
type EntityType = components['schemas']['ChatBreadcrumbsDto']['type'];

type UseEntityActionsParams = {
  entityType: EntityType;
  handlers: EntityActionHandlers;
  isDeleting?: boolean;
};

export const useEntityActions = ({
  entityType,
  handlers,
  isDeleting = false,
}: UseEntityActionsParams): ActionConfig[] => {
  return useMemo(() => {
    if (entityType === 'folder') {
      if (!handlers.onRename) {
        return [];
      }

      return createFolderActions(
        {
          onRename: handlers.onRename,
          onDelete: handlers.onDelete,
        },
        { isDeleting }
      );
    }

    if (entityType === 'chat') {
      if (!handlers.onOpenInNewTab || !handlers.onOpenInSidePanel) {
        return [];
      }

      return createChatActions(
        {
          onDelete: handlers.onDelete,
          onRename: handlers.onRename,
          onOpenInNewTab: handlers.onOpenInNewTab,
          onOpenInSidePanel: handlers.onOpenInSidePanel,
        },
        { isDeleting }
      );
    }

    if (entityType === 'nested_chat') {
      if (!handlers.onOpenInNewTab || !handlers.onOpenInSidePanel) {
        return [];
      }

      return createBranchActions(
        {
          onDelete: handlers.onDelete,
          onOpenInNewTab: handlers.onOpenInNewTab,
          onOpenInSidePanel: handlers.onOpenInSidePanel,
        },
        { isDeleting }
      );
    }

    if (entityType === 'mindlet') {
      if (!handlers.onOpenInNewTab || !handlers.onOpenInSidePanel) {
        return [];
      }

      return createMindletActions(
        {
          onDelete: handlers.onDelete,
          onOpenInNewTab: handlers.onOpenInNewTab,
          onOpenInSidePanel: handlers.onOpenInSidePanel,
        },
        { isDeleting }
      );
    }

    return [];
  }, [entityType, handlers, isDeleting]);
};
