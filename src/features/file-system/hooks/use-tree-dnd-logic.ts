import { useState } from 'react';

import { useMoveChat } from '@features/file-system/hooks/use-move-chat';
import { useMoveDirectory } from '@features/file-system/hooks/use-move-directory';
import type { TreeNode } from '@features/file-system/hooks/use-tree-data';

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

export type DraggableData = {
  type: 'chat' | 'directory';
  id: string;
  parentDirectoryId?: string;
  parentChatId?: string;
  node: TreeNode; // Add the full node data for the overlay
};

export type DroppableData = {
  type: 'expandable-node' | 'root';
  id: string;
  nodeType: 'chat' | 'directory';
  accepts: ('chat' | 'directory')[];
  targetName?: string; // Add target name for logging
};

export const useTreeDndLogic = () => {
  const [activeItem, setActiveItem] = useState<DraggableData | null>(null);

  const { moveChat } = useMoveChat();
  const { moveDirectory } = useMoveDirectory();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as DraggableData;

    setActiveItem(data);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveItem(null);

    if (!over || !active.data.current) {
      return;
    }

    const draggableData = active.data.current as DraggableData;
    const droppableData = over.data.current as DroppableData;

    // Don't allow dropping on itself or its children (prevent circular dependencies)
    if (draggableData.id === droppableData.id) {
      return;
    }

    // For directories, prevent dropping on any of its descendants
    if (draggableData.type === 'directory' && droppableData.type === 'expandable-node') {
      // Check if the drop target is a descendant of the dragged directory
      // This is a basic check - for full validation, server-side check is recommended
      if (isDescendantOf(droppableData.id, draggableData.id, draggableData.node)) {
        return;
      }
    }

    // Validate drop target accepts this item type
    if (!droppableData.accepts.includes(draggableData.type)) {
      return;
    }

    // Handle root drop zone - pass null to move to root level
    const targetParentDirectoryId =
      droppableData.type === 'root' ? null : droppableData.id;

    // Don't move if already in the same parent
    if (draggableData.parentDirectoryId === targetParentDirectoryId) {
      return;
    }

    try {
      if (draggableData.type === 'chat') {
        await moveChat({
          chatId: draggableData.id,
          sourceParentDirectoryId: draggableData.parentDirectoryId,
          sourceParentChatId: draggableData.parentChatId,
          targetParentDirectoryId,
        });
      } else if (draggableData.type === 'directory') {
        await moveDirectory({
          directoryId: draggableData.id,
          sourceParentDirectoryId: draggableData.parentDirectoryId,
          targetParentDirectoryId,
        });
      }
    } catch (error) {
      console.error('❌ Move failed:', error);
      throw error;
      // TODO: Add user notification for failed moves
    }
  };

  const handleDragCancel = () => {
    setActiveItem(null);
  };

  // Helper function to check if a node is a descendant of another node
  // This is a basic client-side check - server should also validate this
  const isDescendantOf = (
    nodeId: string,
    potentialAncestorId: string,
    _ancestorNode: TreeNode
  ): boolean => {
    // Basic check: if we're trying to drop a directory into itself, that's clearly circular
    if (nodeId === potentialAncestorId) {
      return true;
    }

    // For a more complete check, we would need to traverse the full tree structure
    // Since we only have the immediate node data, we do a basic parent check
    // The server should perform a complete tree traversal for full validation
    return false;
  };

  return {
    activeItem,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
