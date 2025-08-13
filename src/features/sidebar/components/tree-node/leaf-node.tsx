import { SidebarMenuButton } from '@components/ui/sidebar';
import { ThemedSpan } from '@components/ui/themed-span';

import { EntityActionsMenu } from '@features/entity-actions/components/entity-actions-menu';
import NodeIcon from '@features/sidebar/components/tree-node/node-icon';
import TooltipWrapper from '@features/sidebar/components/tree-node/tooltip-wrapper';
import type { TreeNode } from '@features/sidebar/hooks/use-tree-data';

type Props = {
  node: TreeNode;
  isActive: boolean;
  isDeleting: boolean;
  onDelete: (id: string) => void;
  onOpenInSidePanel: (id: string) => void;
  onOpenInNewTab: (id: string) => void;
  onClick: VoidFunction;
};

const LeafNode = ({
  node,
  isActive,
  isDeleting,
  onDelete,
  onOpenInSidePanel,
  onOpenInNewTab,
  onClick,
}: Props) => {
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
        isActive={isActive}
        className="group/item relative cursor-pointer gap-1.5 rounded-sm p-1 pr-8
          data-[active=true]:font-normal"
        onClick={onClick}
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
            onDelete: () => onDelete(node.id),
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
