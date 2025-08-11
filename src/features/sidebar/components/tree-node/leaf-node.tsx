import { SidebarMenuButton } from '@shared/components/ui/sidebar';
import { ThemedSpan } from '@shared/components/ui/themed-span';

import MoreActionsMenu from '@features/sidebar/components/more-actions-menu/more-actions-menu';
import type { TreeNode } from '@features/sidebar/hooks/use-tree-data';

import NodeIcon from './node-icon';
import TooltipWrapper from './tooltip-wrapper';
import { useTreeNodeActions } from './use-tree-node-actions';

type Props = {
  node: TreeNode;
  isActive: boolean;
  isDeleting: boolean;
  onDelete: VoidFunction;
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
  const { handleDelete, handleOpenInSidePanel, handleOpenInNewTab } = useTreeNodeActions({
    nodeId: node.id,
    onDelete,
    onOpenInSidePanel,
    onOpenInNewTab,
  });

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
          <NodeIcon nodeType={node.type} />
        </div>
        <ThemedSpan className="text-primary block truncate">{node.name}</ThemedSpan>
        <MoreActionsMenu
          triggerClassNames="opacity-0 group-hover/item:opacity-100"
          onDelete={handleDelete}
          isDeleting={isDeleting}
          onOpenInSidePanel={handleOpenInSidePanel}
          onOpenInNewTab={handleOpenInNewTab}
        />
      </SidebarMenuButton>
    </TooltipWrapper>
  );
};

export default LeafNode;
