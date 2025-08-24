import { useEffect, useState } from 'react';

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
import { useDraggableConfig } from '@features/file-system/components/tree-dnd/use-draggable-config';
import ChildrenList from '@features/file-system/components/tree-node/components/children-list';
import NodeIcon from '@features/file-system/components/tree-node/components/node-icon';
import {
  useFileSystemActions,
  type TreeNode as TreeNodeType,
} from '@features/file-system/use-file-system.actions';

type Props = {
  node: TreeNodeType;
  isActive: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onClick: VoidFunction;
  TreeNodeComponent: React.ComponentType<{
    node: TreeNodeType;
  }>;
};

const ExpandableNode = ({
  node,
  isActive,
  isOpen,
  setIsOpen,
  onClick,
  TreeNodeComponent,
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  const {
    deleteChat,
    deleteDirectory,
    openChatInNewTab,
    openChatInSidePanel,
    renameDirectory,
    renameChat,
    finalizeDirectoryCreation,
    removeTemporaryDirectory,
    startEditing,
  } = useFileSystemActions().actions;
  const { isEditing, isMenuOpen } = useFileSystemActions().helpers;

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
                    onDelete: async () => {
                      if (node.type === 'chat') {
                        await deleteChat({
                          id: node.id,
                          parentChatId: node.parentChatId ?? undefined,
                          parentDirectoryId: node.parentDirectoryId ?? undefined,
                        });
                      } else if (node.type === 'directory') {
                        await deleteDirectory(
                          node.id,
                          node.parentDirectoryId ?? undefined
                        );
                      }
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
              parentNodeType={node.type as 'directory' | 'chat'}
              TreeNodeComponent={TreeNodeComponent}
            />
          </CollapsibleContent>
        </Collapsible>
      </DropZone>
    </SidebarMenuItem>
  );
};

export default ExpandableNode;
