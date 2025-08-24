import { useDraggable } from '@dnd-kit/core';

import type {
  DraggableData,
  DroppableData,
  TreeNode,
} from '@features/file-system/use-file-system.actions';

type UseDraggableConfigProps = {
  node: TreeNode;
  isDisabled?: boolean;
};

type UseDraggableConfigReturn = {
  draggableData: DraggableData;
  droppableData: DroppableData;
  attributes: ReturnType<typeof useDraggable>['attributes'];
  listeners: ReturnType<typeof useDraggable>['listeners'];
  setNodeRef: ReturnType<typeof useDraggable>['setNodeRef'];
  isDragging: boolean;
  dragStyle: React.CSSProperties;
};

/**
 * Hook that encapsulates all drag-and-drop configuration for a tree node
 * @param node - The tree node to make draggable
 * @param isDisabled - Whether dragging should be disabled (e.g., during editing)
 * @returns All necessary drag-and-drop configuration and state
 */
export const useDraggableConfig = ({
  node,
  isDisabled = false,
}: UseDraggableConfigProps): UseDraggableConfigReturn => {
  // Prepare draggable data for when this node is being dragged
  const draggableData: DraggableData = {
    type: node.type as 'chat' | 'directory',
    id: node.id,
    parentDirectoryId: node.parentDirectoryId ?? undefined,
    parentChatId: node.parentChatId ?? undefined,
    node: node, // Pass the complete node for the overlay
  };

  // Prepare droppable data for when other nodes are dropped on this node
  const droppableData: DroppableData = {
    type: 'expandable-node',
    id: node.id,
    nodeType: node.type as 'chat' | 'directory',
    accepts: ['chat', 'directory'], // ExpandableNodes can accept both chats and directories
    targetName: node.name, // Include the target directory name for logging
  };

  // Set up the draggable behavior using @dnd-kit
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${node.id}`,
    data: draggableData,
    disabled: isDisabled,
  });

  // Style adjustments for dragging state
  const dragStyle: React.CSSProperties = {
    // Don't apply transform when using DragOverlay - it handles positioning
    opacity: isDragging ? 0 : 1, // Hide original completely when dragging (overlay shows the full component)
    cursor: isDragging ? 'grabbing' : 'grab', // Show grab cursor
    pointerEvents: isDragging ? ('none' as const) : ('auto' as const), // Prevent interaction when dragging
  };

  return {
    draggableData,
    droppableData,
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    dragStyle,
  };
};
