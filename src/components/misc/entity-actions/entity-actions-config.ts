import {
  ExternalLink,
  Folder,
  Library,
  Loader2,
  PanelRight,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ItemTypeEnum } from '@services/items/items-dtos';

export type EntityAction = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
  action: keyof EntityActionHandlers;
};

export type EntityActionHandlers = {
  onDelete?: (id: string) => void;
  onRename?: (id: string) => void;
  onOpenInNewTab?: (id: string) => void;
  onOpenInSidePanel?: (id: string) => void;
  onConvertToFolder?: (id: string) => void;
  onConvertToProject?: (id: string) => void;
};

export const ENTITY_ACTIONS_CONFIG: Record<ItemTypeEnum, EntityAction[]> = {
  [ItemTypeEnum.Folder]: [
    {
      id: 'rename',
      label: 'Rename',
      icon: Pencil,
      action: 'onRename',
    },
    {
      id: 'convert-to-project',
      label: 'Convert to Project',
      icon: Library,
      action: 'onConvertToProject',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      action: 'onDelete',
    },
  ],

  [ItemTypeEnum.Project]: [
    {
      id: 'rename',
      label: 'Rename',
      icon: Pencil,
      action: 'onRename',
    },
    {
      id: 'convert-to-folder',
      label: 'Convert to Folder',
      icon: Folder,
      action: 'onConvertToFolder',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      action: 'onDelete',
    },
  ],

  [ItemTypeEnum.Note]: [
    {
      id: 'open-new-tab',
      label: 'Open in new tab',
      icon: ExternalLink,
      action: 'onOpenInNewTab',
    },
    {
      id: 'open-side-panel',
      label: 'Open in side panel',
      icon: PanelRight,
      action: 'onOpenInSidePanel',
    },
    {
      id: 'rename',
      label: 'Rename',
      icon: Pencil,
      action: 'onRename',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      action: 'onDelete',
    },
  ],

  [ItemTypeEnum.Chat]: [
    {
      id: 'open-new-tab',
      label: 'Open in new tab',
      icon: ExternalLink,
      action: 'onOpenInNewTab',
    },
    {
      id: 'open-side-panel',
      label: 'Open in side panel',
      icon: PanelRight,
      action: 'onOpenInSidePanel',
    },
    {
      id: 'rename',
      label: 'Rename',
      icon: Pencil,
      action: 'onRename',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      action: 'onDelete',
    },
  ],
};

// Helper function to get loading icon for delete action
export const getActionIcon = (
  action: EntityAction,
  isDeleting: boolean
): React.ComponentType<{ className?: string }> => {
  if (action.id === 'delete' && isDeleting) {
    return Loader2;
  }

  return action.icon;
};

// Helper function to filter actions based on available handlers
export const getAvailableActions = (
  entityType: ItemTypeEnum,
  handlers: EntityActionHandlers,
  isDeleting: boolean = false
): EntityAction[] => {
  const actions = ENTITY_ACTIONS_CONFIG[entityType] || [];

  return actions.filter(action => {
    // Don't show delete action when already deleting
    if (action.id === 'delete' && isDeleting) {
      return false;
    }

    // Only show actions that have corresponding handlers
    return handlers[action.action] !== undefined;
  });
};
