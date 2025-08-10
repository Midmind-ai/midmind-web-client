import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import { ChevronRight } from 'lucide-react';

import { SidebarMenuButton, SidebarMenuItem } from '@shared/components/ui/sidebar';
import { ThemedSpan } from '@shared/components/ui/themed-span';

import MoreActionsMenu from '@features/sidebar/components/more-actions-menu/more-actions-menu';
import type { TreeNode as TreeNodeType } from '@features/sidebar/hooks/use-tree-data';

import ChildrenList from './children-list';
import { NODE_STYLES } from './constants';
import NodeIcon from './node-icon';
import TooltipWrapper from './tooltip-wrapper';
import { useTreeNodeActions } from './use-tree-node-actions';

type Props = {
  node: TreeNodeType;
  isActive: boolean;
  isDeleting: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  childNodes?: TreeNodeType[];
  isLoadingChildren: boolean;
  onDelete: VoidFunction;
  onOpenInSidePanel: (id: string) => void;
  onOpenInNewTab: (id: string) => void;
  onClick: VoidFunction;
  TreeNodeComponent: React.ComponentType<{
    node: TreeNodeType;
    isDeleting: boolean;
    onDelete: VoidFunction;
    onOpenInSidePanel: (id: string) => void;
    onOpenInNewTab: (id: string) => void;
  }>;
};

const ExpandableNode = ({
  node,
  isActive,
  isDeleting,
  isOpen,
  setIsOpen,
  childNodes,
  isLoadingChildren,
  onDelete,
  onOpenInSidePanel,
  onOpenInNewTab,
  onClick,
  TreeNodeComponent,
}: Props) => {
  const { handleDelete, handleOpenInSidePanel, handleOpenInNewTab } = useTreeNodeActions({
    nodeId: node.id,
    onDelete,
    onOpenInSidePanel,
    onOpenInNewTab,
  });

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <SidebarMenuItem>
      <Collapsible
        className={NODE_STYLES.collapsible}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <div className={NODE_STYLES.expandContainer}>
          <CollapsibleTrigger asChild>
            <ChevronRight
              className={NODE_STYLES.chevron}
              onClick={handleChevronClick}
            />
          </CollapsibleTrigger>
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
                isDeleting={isDeleting}
                onDelete={handleDelete}
                onOpenInSidePanel={handleOpenInSidePanel}
                onOpenInNewTab={handleOpenInNewTab}
              />
            </SidebarMenuButton>
          </TooltipWrapper>
        </div>
        <CollapsibleContent>
          <ChildrenList
            isLoadingChildren={isLoadingChildren}
            childNodes={childNodes}
            isDeleting={isDeleting}
            onDelete={onDelete}
            onOpenInSidePanel={onOpenInSidePanel}
            onOpenInNewTab={onOpenInNewTab}
            TreeNodeComponent={TreeNodeComponent}
          />
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};

export default ExpandableNode;
