import { useParams } from 'react-router';

import {
  openChatInNewTab,
  openChatInSidePanel,
  navigateToChat,
} from '@features/chat/hooks/use-split-screen-actions';
import type { LLModel } from '@features/chat/types/chat-types';
import { useInlineEditStore } from '@features/file-system/stores/inline-edit.store';

import { useMenuStateStore } from '@stores/use-menu-state-store';

import { EntityEnum, type ChatBranchContext } from '@shared-types/entities';

import { type TreeNode, type FileSystemData } from './data/use-file-system.data';
import {
  useTreeDndLogic,
  type DraggableData,
  type DroppableData,
} from './hooks/use-tree-dnd-logic';
import { useExpandedNodesStore } from './stores/expanded-nodes.store';

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

// Type definitions for action parameters
type CreateChatArgs = {
  content: string;
  model: LLModel;
  sendMessage?: boolean;
  openInSplitScreen?: boolean;
  parentChatId?: string;
  parentFolderId?: string;
  branchContext?: ChatBranchContext;
};

type DeleteChatParams = {
  id: string;
  parentFolderId?: string;
  parentChatId?: string;
};

// Actions and UI state type for components that need interactivity
type FileSystemActions = {
  // Actions
  actions: {
    // Navigation actions
    openChatInNewTab: (chatId: string) => void;
    openChatInSidePanel: (chatId: string) => void;
    navigateToChat: (chatId: string) => void;

    // UI state actions
    setExpanded: (nodeId: string, expanded: boolean) => void;
    startEditing: (nodeId: string) => void;
    stopEditing: () => void;
    openMenu: (menuId: string) => void;
    closeMenu: (menuId?: string) => void;

    // DND actions
    handleDragStart: (event: DragStartEvent) => void;
    handleDragEnd: (event: DragEndEvent) => Promise<void>;
    handleDragCancel: () => void;
  };

  // UI state (no data)
  ui: {
    expandedNodes: Set<string>;
    editingNodeId: string | null;
    draggedNode: DraggableData | null;
    activeMenuId: string | null;
  };

  // Helper methods (no data dependencies)
  helpers: {
    isExpanded: (nodeId: string) => boolean;
    isEditing: (nodeId: string) => boolean;
    isNodeActive: (node: TreeNode) => boolean;
    handleNodeClick: (node: TreeNode) => void;
    isMenuOpen: (menuId: string) => boolean;
  };
};

// Actions-only hook for components that don't need data fetching
// This prevents unnecessary SWR calls and controller data fetching
export const useFileSystemActions = (): FileSystemActions => {
  const { id: chatId = '' } = useParams();

  // DND logic
  const {
    activeItem: draggedNode,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useTreeDndLogic();

  // Store hooks
  const expandedNodes = useExpandedNodesStore(state => state.expandedNodes);
  const setExpanded = useExpandedNodesStore(state => state.setExpanded);
  const editingNodeId = useInlineEditStore(state => state.editingEntityId);
  const startEditing = useInlineEditStore(state => state.startEditing);
  const stopEditing = useInlineEditStore(state => state.stopEditing);
  const activeMenuId = useMenuStateStore(state => state.activeMenuId);
  const openMenu = useMenuStateStore(state => state.openMenu);
  const closeMenu = useMenuStateStore(state => state.closeMenu);

  // Chat actions are now imported directly

  // Helper functions (no data dependencies)
  const isExpanded = (nodeId: string): boolean => expandedNodes.has(nodeId);
  const isEditing = (nodeId: string): boolean => editingNodeId === nodeId;
  const isMenuOpen = (menuId: string): boolean => activeMenuId === menuId;

  const isNodeActive = (node: TreeNode): boolean => {
    if (node.type === EntityEnum.Chat) {
      return chatId === node.id;
    }

    return false;
  };

  const handleNodeClick = (node: TreeNode): void => {
    if (node.type === EntityEnum.Chat) {
      navigateToChat(node.id);
    }
  };

  return {
    // Actions
    actions: {
      // Navigation actions
      openChatInNewTab,
      openChatInSidePanel,
      navigateToChat,

      // UI state actions
      setExpanded,
      startEditing,
      stopEditing,
      openMenu,
      closeMenu,

      // DND actions
      handleDragStart,
      handleDragEnd,
      handleDragCancel,
    },

    // UI state only - no data
    ui: {
      expandedNodes,
      editingNodeId,
      draggedNode,
      activeMenuId,
    },

    // Helper methods - no data dependencies
    helpers: {
      isExpanded,
      isEditing,
      isNodeActive,
      handleNodeClick,
      isMenuOpen,
    },
  };
};

export type {
  FileSystemData,
  FileSystemActions,
  TreeNode,
  CreateChatArgs,
  DeleteChatParams,
  DraggableData,
  DroppableData,
};
