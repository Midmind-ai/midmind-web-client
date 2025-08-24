import { SidebarMenuButton } from '@components/ui/sidebar';
import { ThemedSpan } from '@components/ui/themed-span';

import { EntityActionsMenu } from '@features/entity-actions/components/entity-actions-menu';
import { useDraggableConfig } from '@features/file-system/components/tree-dnd/use-draggable-config';
import NodeIcon from '@features/file-system/components/tree-node/components/node-icon';
import {
  useFileSystemActions,
  type TreeNode,
} from '@features/file-system/use-file-system.actions';

type Props = {
  node: TreeNode;
  isActive: boolean;
  onClick: VoidFunction;
};

const LeafNode = ({ node, isActive, onClick }: Props) => {
  const {
    deleteChat,
    deleteDirectory,
    openChatInSidePanel,
    openChatInNewTab,
    startEditing,
  } = useFileSystemActions().actions;

  // Drag and drop configuration (draggable only, not droppable for leaf nodes)
  const { attributes, listeners, setNodeRef, dragStyle } = useDraggableConfig({
    node,
    isDisabled: false,
  });

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
          onDelete: async () => {
            if (node.type === 'chat') {
              await deleteChat({
                id: node.id,
                parentChatId: node.parentChatId ?? undefined,
                parentDirectoryId: node.parentDirectoryId ?? undefined,
              });
            } else if (node.type === 'directory') {
              await deleteDirectory(node.id, node.parentDirectoryId ?? undefined);
            }
          },
          onRename: handleRenameAction,
          onOpenInNewTab: () => openChatInNewTab(node.id),
          onOpenInSidePanel: () => openChatInSidePanel(node.id),
        }}
        isDeleting={false}
        triggerClassName="opacity-0 group-hover/item:opacity-100"
        menuId={`leaf-node-${node.id}`}
      />
    </SidebarMenuButton>
  );
};

export default LeafNode;
