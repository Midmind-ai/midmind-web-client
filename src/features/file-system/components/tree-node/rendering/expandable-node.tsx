import { useEffect, useState } from 'react';

import { useDraggable } from '@dnd-kit/core';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import { ChevronRight } from 'lucide-react';

import EditableText from '@components/ui/editable-text';
import { SidebarMenuButton, SidebarMenuItem } from '@components/ui/sidebar';

import { EntityActionsMenu } from '@features/entity-actions/components/entity-actions-menu';
import DropZone from '@features/file-system/components/tree-dnd/drop-zone';
import ChildrenList from '@features/file-system/components/tree-node/rendering/children-list';
import NodeIcon from '@features/file-system/components/tree-node/ui/node-icon';
import { useCreateDirectory } from '@features/file-system/hooks/use-create-directory';
import { useRenameChat } from '@features/file-system/hooks/use-rename-chat';
import { useRenameDirectory } from '@features/file-system/hooks/use-rename-directory';
import type { TreeNode as TreeNodeType } from '@features/file-system/hooks/use-tree-data';
import type {
  DraggableData,
  DroppableData,
} from '@features/file-system/hooks/use-tree-dnd-logic';

import { useInlineEditStore } from '@stores/use-inline-edit-store';

import { useFolderListLogic } from '../../folder-list/use-folder-list-logic';

type Props = {
  node: TreeNodeType;
  isActive: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  childNodes?: TreeNodeType[];
  isLoadingChildren: boolean;
  onRename?: (id: string) => void;
  onOpenInSidePanel: (id: string) => void;
  onOpenInNewTab: (id: string) => void;
  onClick: VoidFunction;
  TreeNodeComponent: React.ComponentType<{
    node: TreeNodeType;
    isDeleting: boolean;
    onDelete: VoidFunction;
    onRename?: VoidFunction;
    onOpenInSidePanel: (id: string) => void;
    onOpenInNewTab: (id: string) => void;
  }>;
};

const ExpandableNode = ({
  node,
  isActive,
  isOpen,
  setIsOpen,
  childNodes,
  isLoadingChildren,
  onRename,
  onOpenInSidePanel,
  onOpenInNewTab,
  onClick,
  TreeNodeComponent,
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { handleDelete, isDeleting } = useFolderListLogic();
  const { renameDirectory } = useRenameDirectory();
  const { renameChat } = useRenameChat();
  const { finalizeDirectoryCreation, removeTemporaryDirectory } = useCreateDirectory();
  const { isEditing, startEditing } = useInlineEditStore();
  const isCurrentlyEditing = isEditing(node.id);

  // Drag and drop setup
  const draggableData: DraggableData = {
    type: node.type as 'chat' | 'directory',
    id: node.id,
    parentDirectoryId: node.parentDirectoryId ?? undefined,
    parentChatId: undefined, // TreeNode doesn't have parentChatId yet
    node: node, // Pass the complete node for the overlay
  };

  const droppableData: DroppableData = {
    type: 'expandable-node',
    id: node.id,
    nodeType: node.type as 'chat' | 'directory',
    accepts: ['chat', 'directory'], // ExpandableNodes can accept both chats and directories
    targetName: node.name, // Include the target directory name for logging
  };

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    isDragging,
  } = useDraggable({
    id: `draggable-${node.id}`,
    data: draggableData,
    disabled: isCurrentlyEditing, // Disable dragging when editing
  });

  const dragStyle = {
    // Don't apply transform when using DragOverlay - it handles positioning
    opacity: isDragging ? 0 : 1, // Hide original completely when dragging (overlay shows the full component)
    cursor: isDragging ? 'grabbing' : 'grab', // Show grab cursor
    pointerEvents: isDragging ? ('none' as const) : ('auto' as const), // Prevent interaction when dragging
  };

  // Reset hover state when entering edit mode
  useEffect(() => {
    if (isCurrentlyEditing) {
      setIsHovered(false);
    } else if (!isCurrentlyEditing) {
      setIsMenuOpen(false);
    }
  }, [isCurrentlyEditing]);

  const handleRename = async (newName: string) => {
    if (node.type === 'directory') {
      // Check if this is a new directory (empty name means it was just created)
      if (node.name === '') {
        // This is a new directory being named for the first time
        await finalizeDirectoryCreation(node.id, newName);
      } else {
        // This is an existing directory being renamed
        await renameDirectory({ id: node.id, name: newName });
      }
    } else if (node.type === 'chat') {
      // Handle chat renaming
      await renameChat(node.id, newName);
    }
  };

  const handleCancel = async () => {
    if (node.type === 'directory' && node.name === '') {
      // This is a new directory being canceled - remove from cache
      const parentDirectoryId = node.parentDirectoryId || undefined;
      await removeTemporaryDirectory(node.id, parentDirectoryId);
    }
    // For chats, no special cancel logic needed - just cancel the edit
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent expand/collapse when in edit mode
    if (isCurrentlyEditing) {
      return;
    }

    setIsOpen(!isOpen);
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

  // Handle rename action for this specific node
  const handleRenameAction = () => {
    startEditing(node.id);
  };

  return (
    <SidebarMenuItem
      ref={setDraggableNodeRef}
      style={dragStyle}
    >
      <DropZone data={droppableData}>
        <Collapsible
          className="group/collapsible [&[data-state=open]>div>svg:first-child]:rotate-90"
          open={isOpen}
          onOpenChange={isCurrentlyEditing ? undefined : setIsOpen}
          disabled={isCurrentlyEditing}
        >
          <div className="flex items-center gap-[3px]">
            <SidebarMenuButton
              isActive={isActive}
              className={`${isCurrentlyEditing ? '[&:active]:bg-transparent [&:active]:text-current' : 'group/item'}
                relative cursor-pointer gap-1.5 rounded-sm p-1 pr-8
                data-[active=true]:font-normal`}
              onClick={isCurrentlyEditing ? undefined : onClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onKeyDown={
                isCurrentlyEditing
                  ? e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  : undefined
              }
              onKeyUp={
                isCurrentlyEditing
                  ? e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  : undefined
              }
              onKeyPress={
                isCurrentlyEditing
                  ? e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  : undefined
              }
              {...attributes}
              {...(isCurrentlyEditing ? {} : listeners)}
            >
              <CollapsibleTrigger asChild>
                <div
                  onClick={handleChevronClick}
                  className={`relative flex size-6 flex-shrink-0 items-center
                    justify-center rounded-[4px] transition-colors ${
                      isCurrentlyEditing
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:bg-sidebar cursor-pointer'
                    }`}
                >
                  <ChevronRight
                    className={`absolute size-5 stroke-[1.5px] transition-transform
                      ${isOpen ? 'rotate-90' : ''}
                      ${isHovered && !isCurrentlyEditing && !isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <div
                    className={`${isHovered && !isCurrentlyEditing && !isMenuOpen ? 'opacity-0' : 'opacity-100'}`}
                  >
                    <NodeIcon
                      nodeType={node.type}
                      hasChildren={node.hasChildren}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>
              <EditableText
                entityId={node.id}
                currentValue={node.name}
                onSave={handleRename}
                onCancel={handleCancel}
                className="text-primary block truncate"
                placeholder={
                  node.type === 'directory' ? 'Directory name...' : 'Chat name...'
                }
              />
              {!isCurrentlyEditing && (
                <EntityActionsMenu
                  entityType={getEntityType()}
                  handlers={{
                    onDelete: () => handleDelete(node.id),
                    onRename: handleRenameAction,
                    onOpenInNewTab: () => onOpenInNewTab(node.id),
                    onOpenInSidePanel: () => onOpenInSidePanel(node.id),
                  }}
                  isDeleting={isDeleting}
                  triggerClassName="opacity-0 group-hover/item:opacity-100"
                  onOpenChange={setIsMenuOpen}
                />
              )}
            </SidebarMenuButton>
          </div>
          <CollapsibleContent>
            <ChildrenList
              isLoadingChildren={isLoadingChildren}
              childNodes={childNodes}
              isDeleting={isDeleting}
              onRename={onRename ? () => onRename(node.id) : undefined}
              onOpenInSidePanel={onOpenInSidePanel}
              onOpenInNewTab={onOpenInNewTab}
              TreeNodeComponent={TreeNodeComponent}
            />
          </CollapsibleContent>
        </Collapsible>
      </DropZone>
    </SidebarMenuItem>
  );
};

export default ExpandableNode;
