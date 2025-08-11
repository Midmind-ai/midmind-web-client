import { useState } from 'react';

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
  const [isHovered, setIsHovered] = useState(false);

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
        className="group/collapsible [&[data-state=open]>div>svg:first-child]:rotate-90"
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <div className="flex items-center gap-[3px]">
          {/* <CollapsibleTrigger asChild>
            <ChevronRight
              className={NODE_STYLES.chevron}
              onClick={handleChevronClick}
            />
          </CollapsibleTrigger> */}
          <TooltipWrapper content={node.name}>
            <SidebarMenuButton
              isActive={isActive}
              className="group/item relative cursor-pointer gap-1.5 rounded-sm p-1 pr-8
                data-[active=true]:font-normal"
              onClick={onClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <CollapsibleTrigger asChild>
                <div
                  onClick={handleChevronClick}
                  className="hover:bg-sidebar relative flex size-6 flex-shrink-0
                    cursor-pointer items-center justify-center rounded-[4px]
                    transition-colors"
                >
                  <ChevronRight
                    className={`absolute size-5 stroke-[1.5px] transition-transform
                      ${isOpen ? 'rotate-90' : ''}
                      ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <div className={`${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                    <NodeIcon nodeType={'chats'} />
                  </div>
                </div>
              </CollapsibleTrigger>
              <ThemedSpan className="text-primary block truncate">{node.name}</ThemedSpan>
              <MoreActionsMenu
                triggerClassNames="opacity-0 group-hover/item:opacity-100"
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
