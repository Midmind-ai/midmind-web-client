import { useDndContext } from '@dnd-kit/core';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import { ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { updateNoteName } from '../../../../../actions/note.actions';
import { cn } from '../../../../../utils/cn';
import { useDragStateStore } from '../../../stores/drag-state.store';
import type { PositionAwareCollisionData } from '../../../utils/position-aware-collision-detection';
import { EntityActionsMenu } from '@components/misc/entity-actions/components/entity-actions-menu';
import EditableText from '@components/ui/editable-text';
import { SidebarMenuButton, SidebarMenuItem } from '@components/ui/sidebar';
import DropZone from '@features/file-system/components/tree-dnd/drop-zone';
import { useDraggableConfig } from '@features/file-system/components/tree-dnd/use-draggable-config';
import ChildrenList from '@features/file-system/components/tree-node/components/children-list';
import NodeIcon from '@features/file-system/components/tree-node/components/node-icon';
import {
  useFileSystemActions,
  type Item,
} from '@features/file-system/hooks/use-file-system.actions';
import { useFileSystemStore } from '@features/file-system/stores/file-system.store';
import { useInlineEditStore } from '@features/file-system/stores/inline-edit.store';
import {
  getItemDisplayName,
  getItemEntityType,
  getItemHasChildren,
  getItemParentDirectoryId,
} from '@features/file-system/utils/item-helpers';
import { ItemTypeEnum } from '@services/items/items-dtos';
import { useMenuStateStore } from '@stores/menu-state.store';

type Props = {
  node: Item;
  isActive: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onClick: VoidFunction;
  TreeNodeComponent: React.ComponentType<{ node: Item }>;
};

const ExpandableNode = React.memo(
  ({ node, isActive, isOpen, setIsOpen, onClick, TreeNodeComponent }: Props) => {
    const [isHovered, setIsHovered] = useState(false);

    // Store actions (cache revalidation handled inside store)
    const deleteItem = useFileSystemStore(state => state.deleteItem);
    const finalizeItemCreation = useFileSystemStore(state => state.finalizeItemCreation);
    const removeTemporaryItem = useFileSystemStore(state => state.removeTemporaryItem);
    const convertItemType = useFileSystemStore(state => state.convertItemType);

    // Still need actions for other operations
    const { openChatInNewTab, openChatInSidePanel } = useFileSystemActions().actions;
    const { isEditing, startEditing } = useInlineEditStore();
    const { isMenuOpen } = useMenuStateStore();

    const isCurrentlyEditing = isEditing(node.id);
    const isCurrentMenuOpen = isMenuOpen(`expandable-node-${node.id}`);
    const isDraggingAnyItem = useDragStateStore(state => state.isDraggingAny);

    // Drag and drop configuration
    const {
      droppableData,
      attributes,
      listeners,
      setNodeRef: setDraggableNodeRef,
      dragStyle,
      isDragging,
    } = useDraggableConfig({
      node,
      isDisabled: isCurrentlyEditing,
    });

    // Reset hover state when entering edit mode
    useEffect(() => {
      if (isCurrentlyEditing) {
        setIsHovered(false);
      }
    }, [isCurrentlyEditing]);

    const handleRename = async (newName: string) => {
      if (node?.payload?.name === '') {
        // This is a new item being named for the first time
        await finalizeItemCreation(
          node.id,
          newName,
          node.type as ItemTypeEnum,
          getItemParentDirectoryId(node) || undefined
        );
      } else {
        // Use the unified renameItem for all types
        await updateNoteName(node.id, newName);
      }
    };

    const handleCancel = async () => {
      const nodeType = String(node.type);
      const isFolder = nodeType === ItemTypeEnum.Folder || nodeType === 'folder';
      const isNote = nodeType === ItemTypeEnum.Note || nodeType === 'note';

      if ((isFolder || isNote) && getItemDisplayName(node) === '') {
        // This is a new item being canceled - remove from store
        const parentId = getItemParentDirectoryId(node) || undefined;
        removeTemporaryItem(node.id, parentId);
      }
      // For chats and existing items, no special cancel logic needed - just cancel the edit
    };

    const handleChevronClick = (e: React.MouseEvent) => {
      e.stopPropagation();

      // Prevent expand/collapse when in edit mode
      if (isCurrentlyEditing) {
        return;
      }

      setIsOpen(!isOpen);
    };

    // Handle rename action for this specific node
    const handleRenameAction = () => {
      startEditing(node.id);
    };

    const { collisions } = useDndContext();
    const currentCollision = collisions?.find(collision => collision.id === node.id);
    const currentIntent = (currentCollision?.data as PositionAwareCollisionData)
      ?.positionWithinDropZone;

    return (
      <SidebarMenuItem
        ref={setDraggableNodeRef}
        style={dragStyle}
      >
        <DropZone
          data={droppableData}
          enablePositionDetection={true}
        >
          <Collapsible
            className="group/collapsible
              [&[data-state=open]>div>svg:first-child]:rotate-90"
            open={isOpen}
            onOpenChange={isCurrentlyEditing ? undefined : setIsOpen}
            disabled={isCurrentlyEditing}
          >
            <div className="flex items-center gap-[3px]">
              <SidebarMenuButton
                isActive={isActive}
                className={cn(
                  'relative h-8 cursor-pointer gap-1.5 rounded-sm p-1 pr-8',
                  'data-[active=true]:font-normal',
                  isCurrentlyEditing
                    ? '[&:active]:bg-transparent [&:active]:text-current'
                    : 'group/item',
                  {
                    'pointer-events-none':
                      isDraggingAnyItem && currentIntent !== 'inside',
                  }
                )}
                onClick={isCurrentlyEditing || isCurrentMenuOpen ? undefined : onClick}
                onMouseEnter={() => !isDragging && setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onBlur={() => setIsHovered(false)}
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
                        ${isHovered && !isCurrentlyEditing ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <div
                      className={`${isHovered && !isCurrentlyEditing ? 'opacity-0' : 'opacity-100'}`}
                    >
                      <NodeIcon
                        nodeType={getItemEntityType(node)}
                        hasChildren={getItemHasChildren(node)}
                      />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <EditableText
                  entityId={node.id}
                  currentValue={getItemDisplayName(node)}
                  onSave={handleRename}
                  onCancel={handleCancel}
                  className="text-primary block truncate"
                  placeholder={
                    getItemEntityType(node) === ItemTypeEnum.Folder
                      ? 'Folder name...'
                      : getItemEntityType(node) === ItemTypeEnum.Note
                        ? 'Note name...'
                        : 'Chat name...'
                  }
                />
                {!isCurrentlyEditing && (
                  <EntityActionsMenu
                    entityType={getItemEntityType(node)}
                    handlers={{
                      onDelete: async () => {
                        // Use unified deleteItem for all types
                        await deleteItem(
                          node.id,
                          getItemParentDirectoryId(node) ?? undefined
                        );
                      },
                      onRename: handleRenameAction,
                      onOpenInNewTab: () => openChatInNewTab(node.id),
                      onOpenInSidePanel: () => openChatInSidePanel(node.id),
                      onConvertToFolder: () =>
                        convertItemType(node.id, ItemTypeEnum.Folder),
                      onConvertToProject: () =>
                        convertItemType(node.id, ItemTypeEnum.Project),
                      onConvertToNote: () => convertItemType(node.id, ItemTypeEnum.Note),
                      onConvertToPrompt: () =>
                        convertItemType(node.id, ItemTypeEnum.Prompt),
                    }}
                    isDeleting={false}
                    triggerClassName="opacity-0 group-hover/item:opacity-100"
                    menuId={`expandable-node-${node.id}`}
                    setIsHovered={setIsHovered}
                  />
                )}
              </SidebarMenuButton>
            </div>
            <CollapsibleContent>
              <ChildrenList
                parentNodeId={node.id}
                isProjectChildrenList={node.type === ItemTypeEnum.Project}
                TreeNodeComponent={TreeNodeComponent}
              />
            </CollapsibleContent>
          </Collapsible>
        </DropZone>
      </SidebarMenuItem>
    );
  }
);

export default ExpandableNode;
