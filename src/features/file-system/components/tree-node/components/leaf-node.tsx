import { EntityActionsMenu } from '@components/misc/entity-actions/components/entity-actions-menu';
import { SidebarMenuButton } from '@components/ui/sidebar';
import { ThemedSpan } from '@components/ui/themed-span';
import { useDraggableConfig } from '@features/file-system/components/tree-dnd/use-draggable-config';
import NodeIcon from '@features/file-system/components/tree-node/components/node-icon';
import {
  useFileSystemActions,
  type Item,
} from '@features/file-system/hooks/use-file-system.actions';
import { useFileSystemStore } from '@features/file-system/stores/file-system.store';
import {
  getItemDisplayName,
  getItemEntityType,
  getItemHasChildren,
  getItemParentDirectoryId,
} from '@features/file-system/utils/item-helpers';

type Props = {
  node: Item;
  isActive: boolean;
  onClick: VoidFunction;
};

const LeafNode = ({ node, isActive, onClick }: Props) => {
  // Store actions (cache revalidation handled inside store)
  const deleteItem = useFileSystemStore(state => state.deleteItem);

  // Still need actions for other operations
  const { openChatInSidePanel, openChatInNewTab, startEditing } =
    useFileSystemActions().actions;

  // Drag and drop configuration (draggable only, not droppable for leaf nodes)
  const { attributes, listeners, setNodeRef, dragStyle } = useDraggableConfig({
    node,
    isDisabled: false,
  });

  // Handle rename action for this specific node
  const handleRenameAction = () => {
    startEditing(node.id);
  };

  return (
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
          nodeType={getItemEntityType(node)}
          hasChildren={getItemHasChildren(node)}
        />
      </div>
      <ThemedSpan className="text-primary block truncate">
        {getItemDisplayName(node)}
      </ThemedSpan>
      <EntityActionsMenu
        entityType={getItemEntityType(node)}
        handlers={{
          onDelete: async () => {
            // Use unified deleteItem for all types
            await deleteItem(node.id, getItemParentDirectoryId(node) ?? undefined);
          },
          onRename: handleRenameAction,
          onOpenInNewTab: () => openChatInNewTab(node.id),
          onOpenInSidePanel: () => openChatInSidePanel(node.id),
        }}
        isDeleting={false}
        triggerClassName="opacity-0 group-hover/item:opacity-100"
        menuId={`leaf-node-${node.id}`}
        setIsHovered={() => {}}
      />
    </SidebarMenuButton>
  );
};

export default LeafNode;
