import { useParams } from 'react-router';

import { useSplitScreenActions } from '@features/chat/hooks/use-split-screen-actions';
import type { LLModel } from '@features/chat/types/chat-types';

import { useInlineEditStore } from '@stores/use-inline-edit-store';
import { useMenuStateStore } from '@stores/use-menu-state-store';

import type { ChatBranchContext } from '@shared-types/entities';

import { useCreateChat } from './actions/use-create-chat';
import { useCreateDirectory } from './actions/use-create-directory';
import { useDeleteChat } from './actions/use-delete-chat';
import { useDeleteDirectory } from './actions/use-delete-directory';
import { useMoveChat } from './actions/use-move-chat';
import { useMoveDirectory } from './actions/use-move-directory';
import { useRenameChat } from './actions/use-rename-chat';
import { useRenameDirectory } from './actions/use-rename-directory';
import {
  useTreeDndLogic,
  type DraggableData,
  type DroppableData,
} from './actions/use-tree-dnd-logic';
import { useExpandedNodesStore } from './stores/use-expanded-nodes-store';
import { type TreeNode, type FileSystemData } from './use-file-system.data';

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

// Type definitions for action parameters
type CreateChatArgs = {
  content: string;
  model: LLModel;
  sendMessage?: boolean;
  openInSplitScreen?: boolean;
  parentChatId?: string;
  parentDirectoryId?: string;
  branchContext?: ChatBranchContext;
};

type DeleteChatParams = {
  id: string;
  parentDirectoryId?: string;
  parentChatId?: string;
};

type MoveChatParams = {
  chatId: string;
  sourceParentDirectoryId?: string | null;
  sourceParentChatId?: string | null;
  targetParentDirectoryId?: string | null;
};

type MoveDirectoryParams = {
  directoryId: string;
  sourceParentDirectoryId?: string | null;
  targetParentDirectoryId?: string | null;
};

// Actions and UI state type for components that need interactivity
type FileSystemActions = {
  // Actions
  actions: {
    // Chat operations
    createChat: (args: CreateChatArgs) => Promise<string>;
    deleteChat: (params: DeleteChatParams) => Promise<void>;
    renameChat: (id: string, name: string) => Promise<void>;
    moveChat: (params: MoveChatParams) => Promise<void>;

    // Directory operations
    createTemporaryDirectory: (parentId?: string) => Promise<string>;
    finalizeDirectoryCreation: (
      id: string,
      name: string,
      parentId?: string
    ) => Promise<void>;
    removeTemporaryDirectory: (id: string, parentId?: string) => Promise<void>;
    deleteDirectory: (id: string, parentId?: string) => Promise<void>;
    renameDirectory: (params: { id: string; name: string }) => Promise<void>;
    moveDirectory: (params: MoveDirectoryParams) => Promise<void>;

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

  // CRUD hooks for chats
  const { createChat } = useCreateChat();
  const { deleteChat } = useDeleteChat();
  const { renameChat } = useRenameChat();
  const { moveChat } = useMoveChat();

  // CRUD hooks for directories
  const {
    createTemporaryDirectory,
    finalizeDirectoryCreation,
    removeTemporaryDirectory,
  } = useCreateDirectory();
  const { deleteDirectory } = useDeleteDirectory();
  const { renameDirectory } = useRenameDirectory();
  const { moveDirectory } = useMoveDirectory();

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

  // Chat actions
  const { openChatInNewTab, openChatInSidePanel, navigateToChat } =
    useSplitScreenActions();

  // Helper functions (no data dependencies)
  const isExpanded = (nodeId: string): boolean => expandedNodes.has(nodeId);
  const isEditing = (nodeId: string): boolean => editingNodeId === nodeId;
  const isMenuOpen = (menuId: string): boolean => activeMenuId === menuId;

  const isNodeActive = (node: TreeNode): boolean => {
    if (node.type === 'chat') {
      return chatId === node.id;
    }

    return false;
  };

  const handleNodeClick = (node: TreeNode): void => {
    if (node.type === 'chat') {
      navigateToChat(node.id);
    }
  };

  return {
    // Actions
    actions: {
      // Chat actions
      createChat,
      deleteChat,
      renameChat,
      moveChat,

      // Directory actions
      createTemporaryDirectory,
      finalizeDirectoryCreation,
      removeTemporaryDirectory,
      deleteDirectory,
      renameDirectory,
      moveDirectory,

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
