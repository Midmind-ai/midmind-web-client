import { ExternalLink, Loader2, Pencil, PanelRight, Trash2 } from 'lucide-react';

import type { ActionConfig } from '../types/action-config';

type FolderActionHandlers = {
  onRename: () => void;
  onDelete: () => void;
};

type ChatActionHandlers = {
  onDelete: () => void;
  onRename?: () => void;
  onOpenInNewTab: () => void;
  onOpenInSidePanel: () => void;
};

type BranchActionHandlers = {
  onDelete: () => void;
  onOpenInNewTab: () => void;
  onOpenInSidePanel: () => void;
};

type MindletActionHandlers = {
  onDelete: () => void;
  onOpenInNewTab: () => void;
  onOpenInSidePanel: () => void;
};

export const createFolderActions = (
  handlers: FolderActionHandlers,
  options: { isDeleting?: boolean } = {}
): ActionConfig[] => [
  {
    key: 'rename',
    label: 'Rename',
    icon: Pencil,
    handler: e => {
      e.stopPropagation();
      handlers.onRename();
    },
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: options.isDeleting ? Loader2 : Trash2,
    variant: 'destructive',
    loading: options.isDeleting,
    handler: e => {
      e.stopPropagation();
      handlers.onDelete();
    },
  },
];

export const createChatActions = (
  handlers: ChatActionHandlers,
  options: { isDeleting?: boolean } = {}
): ActionConfig[] => {
  const actions: ActionConfig[] = [
    {
      key: 'open-new-tab',
      label: 'Open in new tab',
      icon: ExternalLink,
      handler: e => {
        e.stopPropagation();
        handlers.onOpenInNewTab();
      },
    },
    {
      key: 'open-side-panel',
      label: 'Open in side panel',
      icon: PanelRight,
      handler: e => {
        e.stopPropagation();
        handlers.onOpenInSidePanel();
      },
    },
  ];

  // Add rename action if handler is provided
  if (handlers.onRename) {
    actions.push({
      key: 'rename',
      label: 'Rename',
      icon: Pencil,
      handler: e => {
        e.stopPropagation();
        handlers.onRename?.();
      },
    });
  }

  // Add delete action
  actions.push({
    key: 'delete',
    label: 'Delete',
    icon: options.isDeleting ? Loader2 : Trash2,
    variant: 'destructive',
    loading: options.isDeleting,
    handler: e => {
      e.stopPropagation();
      handlers.onDelete();
    },
  });

  return actions;
};

export const createBranchActions = (
  handlers: BranchActionHandlers,
  options: { isDeleting?: boolean } = {}
): ActionConfig[] => [
  {
    key: 'open-new-tab',
    label: 'Open in new tab',
    icon: ExternalLink,
    handler: e => {
      e.stopPropagation();
      handlers.onOpenInNewTab();
    },
  },
  {
    key: 'open-side-panel',
    label: 'Open in side panel',
    icon: PanelRight,
    handler: e => {
      e.stopPropagation();
      handlers.onOpenInSidePanel();
    },
  },
  {
    key: 'delete',
    label: 'Delete branch',
    icon: options.isDeleting ? Loader2 : Trash2,
    variant: 'destructive',
    loading: options.isDeleting,
    handler: e => {
      e.stopPropagation();
      handlers.onDelete();
    },
  },
];

export const createMindletActions = (
  handlers: MindletActionHandlers,
  options: { isDeleting?: boolean } = {}
): ActionConfig[] => [
  {
    key: 'open-new-tab',
    label: 'Open in new tab',
    icon: ExternalLink,
    handler: e => {
      e.stopPropagation();
      handlers.onOpenInNewTab();
    },
  },
  {
    key: 'open-side-panel',
    label: 'Open in side panel',
    icon: PanelRight,
    handler: e => {
      e.stopPropagation();
      handlers.onOpenInSidePanel();
    },
  },
  {
    key: 'delete',
    label: 'Delete mindlet',
    icon: options.isDeleting ? Loader2 : Trash2,
    variant: 'destructive',
    loading: options.isDeleting,
    handler: e => {
      e.stopPropagation();
      handlers.onDelete();
    },
  },
];
