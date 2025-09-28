import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import { ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
    const renameItem = useFileSystemStore(state => state.renameItem);
    const deleteItem = useFileSystemStore(state => state.deleteItem);
    const finalizeItemCreation = useFileSystemStore(state => state.finalizeItemCreation);
    const removeTemporaryItem = useFileSystemStore(state => state.removeTemporaryItem);

    // Still need actions for other operations
    const { openChatInNewTab, openChatInSidePanel } = useFileSystemActions().actions;
    const { isEditing, startEditing } = useInlineEditStore();
    const { isMenuOpen } = useMenuStateStore();

    const isCurrentlyEditing = isEditing(node.id);
    const isCurrentMenuOpen = isMenuOpen(`expandable-node-${node.id}`);

    // Drag and drop configuration
    const {
      droppableData,
      attributes,
      listeners,
      setNodeRef: setDraggableNodeRef,
      dragStyle,
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
      const nodeType = String(node.type);
      const isFolder = nodeType === ItemTypeEnum.Folder;
      const isNote = nodeType === ItemTypeEnum.Note;

      if ((isFolder || isNote) && node?.payload?.name === '') {
        // This is a new item being named for the first time
        const itemType = isFolder ? ItemTypeEnum.Folder : ItemTypeEnum.Note;
        await finalizeItemCreation(
          node.id,
          newName,
          itemType,
          getItemParentDirectoryId(node) || undefined
        );
      } else {
        // Use the unified renameItem for all types
        await renameItem(node.id, newName);
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
                className={`${isCurrentlyEditing ? '[&:active]:bg-transparent [&:active]:text-current' : 'group/item'}
                  relative h-8 cursor-pointer gap-1.5 rounded-sm p-1 pr-8
                  data-[active=true]:font-normal`}
                onClick={isCurrentlyEditing || isCurrentMenuOpen ? undefined : onClick}
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
                    }}
                    isDeleting={false}
                    triggerClassName="opacity-0 group-hover/item:opacity-100"
                    menuId={`expandable-node-${node.id}`}
                  />
                )}
              </SidebarMenuButton>
            </div>
            <CollapsibleContent>
              <ChildrenList
                parentNodeId={node.id}
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
