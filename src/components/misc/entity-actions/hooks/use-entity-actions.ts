import { useMemo } from 'react';
import type { ActionConfig } from '@components/misc/entity-actions/types/action-config';
import type { EntityActionHandlers } from '@components/misc/entity-actions/types/entity-action-handlers';
import {
  createFolderActions,
  createChatActions,
  createNoteActions,
} from '@components/misc/entity-actions/utils/action-creators';
import { ItemTypeEnum } from '@services/items/items-dtos';

type UseEntityActionsParams = {
  entityType: ItemTypeEnum;
  handlers: EntityActionHandlers;
  isDeleting?: boolean;
};

export const useEntityActions = ({
  entityType,
  handlers,
  isDeleting = false,
}: UseEntityActionsParams): ActionConfig[] => {
  return useMemo(() => {
    if (entityType === ItemTypeEnum.Folder) {
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

    if (entityType === ItemTypeEnum.Chat) {
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

    if (entityType === ItemTypeEnum.Note) {
      if (!handlers.onRename) {
        return [];
      }

      return createNoteActions(
        {
          onRename: handlers.onRename,
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
