import { useMemo } from 'react';

import {
  createFolderActions,
  createChatActions,
  createBranchActions,
  createMindletActions,
} from '../utils/action-creators';

import type { ActionConfig } from '../types/action-config';
import type { EntityActionHandlers } from '../types/entity-action-handlers';
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
        console.warn('Folder actions require onRename handler');

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
        console.warn(
          'Chat actions require onOpenInNewTab and onOpenInSidePanel handlers'
        );

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

    if (entityType === 'branch') {
      if (!handlers.onOpenInNewTab || !handlers.onOpenInSidePanel) {
        console.warn(
          'Branch actions require onOpenInNewTab and onOpenInSidePanel handlers'
        );

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
        console.warn(
          'Mindlet actions require onOpenInNewTab and onOpenInSidePanel handlers'
        );

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

    // Return empty array for unknown entity types
    return [];
  }, [entityType, handlers, isDeleting]);
};
