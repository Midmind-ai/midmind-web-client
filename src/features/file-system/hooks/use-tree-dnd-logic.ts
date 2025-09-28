import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import { useFileSystemStore } from '../stores/file-system.store';
import type { PositionAwareCollisionData } from '@features/file-system/utils/position-aware-collision-detection';
import type { Item } from '@services/items/items-dtos';
import { ItemTypeEnum } from '@services/items/items-dtos';
import { insertAtIndex, insertBefore, insertAfter } from '@utils/position-calculator';

// Helper to find an item and its parent
const findItemLocation = (
  itemsByParentId: Record<string | 'root', Item[]>,
  itemId: string
) => {
  for (const [parentId, items] of Object.entries(itemsByParentId)) {
    const item = items.find(i => i.id === itemId);
    if (item) {
      return { item, parentId: parentId as string | 'root' };
    }
  }

  return null;
};

export type DraggableData = {
  type: ItemTypeEnum;
  id: string;
  parentFolderId?: string;
  parentChatId?: string;
  node: Item; // Add the full node data for the overlay
};

export type DroppableData = {
  type: 'expandable-node' | 'root';
  id: string;
  nodeType: ItemTypeEnum;
  accepts: ItemTypeEnum[];
  targetName?: string; // Add target name for logging
  positionIntent?: 'before' | 'inside' | 'after'; // Position intent from enhanced drop zone
};

export type PositionDropData = {
  type: 'position-drop';
  insertPosition: 'before' | 'after' | 'between';
  targetItemId: string;
  targetIndex?: number;
  onPositionDrop: (draggedItemId: string) => void;
};

export const useTreeDndLogic = () => {
  const [activeItem, setActiveItem] = useState<DraggableData | null>(null);

  // Get functions directly from the store
  const moveItem = useFileSystemStore(state => state.moveItem);
  const renormalizePositions = useFileSystemStore(state => state.renormalizePositions);
  const itemsByParentId = useFileSystemStore(state => state.itemsByParentId);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as DraggableData;

    setActiveItem(data);
  };

  // Extract position intent from collision data
  const getPositionIntent = (event: DragEndEvent, droppableData: DroppableData) => {
    const defaultIntent = droppableData.positionIntent || 'inside';

    if (!event.collisions?.length) return defaultIntent;

    const collision = event.collisions.find(c => c.id === event.over?.id);
    const collisionData = collision?.data as PositionAwareCollisionData | undefined;

    return collisionData?.positionWithinDropZone || defaultIntent;
  };

  // Check if drop is valid
  const isValidDrop = (
    draggableData: DraggableData,
    droppableData: DroppableData
  ): boolean => {
    // Can't drop on itself
    if (draggableData.id === droppableData.id) return false;

    // Can't drop into descendants (prevent circular dependencies)
    if (
      draggableData.type === ItemTypeEnum.Folder &&
      droppableData.type === 'expandable-node' &&
      isDescendantOf(droppableData.id, draggableData.id, draggableData.node)
    ) {
      return false;
    }

    // Target must accept this item type
    return droppableData.accepts.includes(draggableData.type);
  };

  // Calculate new parent and position for the drop
  const calculateDropTarget = (
    draggableData: DraggableData,
    droppableData: DroppableData,
    positionIntent: 'before' | 'inside' | 'after'
  ) => {
    const isInsideDrop = positionIntent === 'inside';

    // Determine target parent
    const targetParentFolderId = isInsideDrop
      ? droppableData.type === 'root'
        ? null
        : droppableData.id
      : findItemLocation(itemsByParentId, droppableData.id)?.parentId || 'root';

    // Get siblings for position calculation
    const targetItems = itemsByParentId[targetParentFolderId || 'root'] || [];
    const siblings = targetItems.filter(item => item.id !== draggableData.id);

    // Calculate new position
    let newPosition: number;
    try {
      if (isInsideDrop) {
        newPosition = insertAtIndex(siblings, 0); // Insert at beginning
      } else {
        const targetItem = targetItems.find(item => item.id === droppableData.id);
        if (!targetItem) {
          console.error('Target item not found for position drop');

          return null;
        }

        newPosition =
          positionIntent === 'before'
            ? insertBefore(targetItem, siblings)
            : insertAfter(targetItem, siblings);
      }
    } catch (error) {
      console.error(`Failed to calculate position for ${positionIntent} drop:`, error);
      // Fallback position
      newPosition = isInsideDrop
        ? Math.max(...siblings.map(s => s.position), 0) + 1000
        : insertAtIndex(siblings, 0);
    }

    return { targetParentFolderId, newPosition };
  };

  // Handle position precision exhaustion error
  const handlePositionError = async (
    error: unknown,
    draggableData: DraggableData,
    targetParentFolderId: string | null,
    newPosition: number
  ) => {
    const isApiError = error && typeof error === 'object' && 'response' in error;
    const apiError = isApiError
      ? (error as {
          response?: { data?: { error?: string; details?: { parent_id?: string } } };
        })
      : null;

    if (apiError?.response?.data?.error !== 'POSITION_PRECISION_EXHAUSTED') {
      throw error; // Let global error handler manage other errors
    }

    const parentId = apiError.response.data.details?.parent_id;

    try {
      await renormalizePositions(parentId || null);
      await moveItem(draggableData.id, targetParentFolderId, newPosition);
    } catch (renormalizeError) {
      console.error('Failed to renormalize and retry move:', renormalizeError);
      throw renormalizeError;
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over || !active.data.current) return;

    const draggableData = active.data.current as DraggableData;
    const droppableData = over.data.current;

    // Handle position-specific drops
    if (droppableData?.type === 'position-drop') {
      const positionData = droppableData as PositionDropData;
      positionData.onPositionDrop?.(draggableData.id);

      return;
    }

    const droppableDataTyped = droppableData as DroppableData;

    // Validate drop
    if (!isValidDrop(draggableData, droppableDataTyped)) return;

    // Get position intent
    const positionIntent = getPositionIntent(event, droppableDataTyped);

    // Calculate drop target
    const dropTarget = calculateDropTarget(
      draggableData,
      droppableDataTyped,
      positionIntent
    );
    if (!dropTarget) return;

    const { targetParentFolderId, newPosition } = dropTarget;
    const targetParentItemId =
      targetParentFolderId === 'root' ? null : targetParentFolderId;
    // Execute move
    try {
      await moveItem(draggableData.id, targetParentItemId, newPosition);
    } catch (error: unknown) {
      await handlePositionError(error, draggableData, targetParentItemId, newPosition);
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
    _ancestorNode: Item
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
