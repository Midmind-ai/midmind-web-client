import { useDraggable } from '@dnd-kit/core';

import { SidebarMenuButton } from '@components/ui/sidebar';
import { ThemedSpan } from '@components/ui/themed-span';

import { EntityActionsMenu } from '@features/entity-actions/components/entity-actions-menu';
import NodeIcon from '@features/file-system/components/tree-node/ui/node-icon';
import TooltipWrapper from '@features/file-system/components/tree-node/ui/tooltip-wrapper';
import type { TreeNode } from '@features/file-system/hooks/use-tree-data';
import type { DraggableData } from '@features/file-system/hooks/use-tree-dnd-logic';

import { useFolderListLogic } from '../../folder-list/use-folder-list-logic';

type Props = {
  node: TreeNode;
  isActive: boolean;
  onOpenInSidePanel: (id: string) => void;
  onOpenInNewTab: (id: string) => void;
  onClick: VoidFunction;
};

const LeafNode = ({
  node,
  isActive,
  onOpenInSidePanel,
  onOpenInNewTab,
  onClick,
}: Props) => {
  const { handleDelete, isDeleting } = useFolderListLogic();

  // Drag setup for LeafNode (draggable only, not droppable)
  const draggableData: DraggableData = {
    type: node.type as 'chat' | 'directory',
    id: node.id,
    parentDirectoryId: node.parentDirectoryId ?? undefined,
    parentChatId: undefined, // TreeNode doesn't have parentChatId yet
    node: node, // Pass the complete node for the overlay
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${node.id}`,
    data: draggableData,
  });

  const dragStyle = {
    // Don't apply transform when using DragOverlay - it handles positioning
    opacity: isDragging ? 0 : 1, // Hide original completely when dragging (overlay shows the full component)
    cursor: isDragging ? 'grabbing' : 'grab', // Show grab cursor
    pointerEvents: isDragging ? ('none' as const) : ('auto' as const), // Prevent interaction when dragging
  };

  // Map tree node types to entity types
  const getEntityType = () => {
    if (node.type === 'directory') {
      return 'folder' as const;
    }
    if (node.type === 'chat') {
      return 'chat' as const;
    }

    // Add mappings for other types as needed
    return 'folder' as const; // fallback
  };

  return (
    <TooltipWrapper content={node.name}>
      <SidebarMenuButton
        ref={setNodeRef}
        style={dragStyle}
        isActive={isActive}
        className="group/item relative cursor-pointer gap-1.5 rounded-sm p-1 pr-8
          data-[active=true]:font-normal"
        onClick={onClick}
        {...attributes}
        {...listeners}
      >
        <div
          className="flex size-6 flex-shrink-0 cursor-pointer items-center justify-center
            rounded-[4px] transition-colors"
        >
          <NodeIcon
            nodeType={node.type}
            hasChildren={node.hasChildren}
          />
        </div>
        <ThemedSpan className="text-primary block truncate">{node.name}</ThemedSpan>
        <EntityActionsMenu
          entityType={getEntityType()}
          handlers={{
            onDelete: () => handleDelete(node.id),
            onOpenInNewTab: () => onOpenInNewTab(node.id),
            onOpenInSidePanel: () => onOpenInSidePanel(node.id),
          }}
          isDeleting={isDeleting}
          triggerClassName="opacity-0 group-hover/item:opacity-100"
        />
      </SidebarMenuButton>
    </TooltipWrapper>
  );
};

export default LeafNode;
