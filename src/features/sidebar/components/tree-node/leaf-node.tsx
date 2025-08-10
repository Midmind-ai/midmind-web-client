import { SidebarMenuButton } from '@shared/components/ui/sidebar';
import { ThemedSpan } from '@shared/components/ui/themed-span';

import MoreActionsMenu from '@features/sidebar/components/more-actions-menu/more-actions-menu';
import type { TreeNode } from '@features/sidebar/hooks/use-tree-data';

import { NODE_STYLES } from './constants';
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
        className={NODE_STYLES.menuButton}
        onClick={onClick}
      >
        <NodeIcon nodeType={node.type} />
        <ThemedSpan className={NODE_STYLES.nodeText}>{node.name}</ThemedSpan>
        <MoreActionsMenu
          triggerClassNames={NODE_STYLES.moreActionsMenu}
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
