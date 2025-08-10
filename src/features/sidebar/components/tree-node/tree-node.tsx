import { useState } from 'react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import { ChevronRight, Folder, MessageSquare } from 'lucide-react';

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from '@shared/components/ui/sidebar';
import { Skeleton } from '@shared/components/ui/skeleton';
import { ThemedSpan } from '@shared/components/ui/themed-span';

import MoreActionsMenu from '@features/sidebar/components/more-actions-menu/more-actions-menu';
import { useTreeNodeLogic } from '@features/sidebar/components/tree-node/use-tree-node-logic';
import type { TreeNode as TreeNodeType } from '@features/sidebar/hooks/use-tree-data';

type Props = {
  node: TreeNodeType;
  onDelete: VoidFunction;
  isDeleting: boolean;
  onOpenInSidePanel: (id: string) => void;
  onOpenInNewTab: (id: string) => void;
};

const TreeNode = ({
  node,
  onDelete,
  isDeleting,
  onOpenInSidePanel,
  onOpenInNewTab,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isActive, handleClick, childNodes, isLoadingChildren } = useTreeNodeLogic(
    node,
    isOpen
  );

  // For leaf nodes (chats without children or directories without children)
  if (!node.hasChildren) {
    return (
      <SidebarMenuButton
        isActive={isActive}
        className="group/item relative cursor-pointer gap-1.5 rounded-sm p-1.5
          group-has-data-[sidebar=menu-action]/menu-item:pr-1.5 hover:pr-8
          data-[active=true]:font-normal"
        onClick={handleClick}
      >
        {node.type === 'chat' ? (
          <MessageSquare className="stroke-[1.5px]" />
        ) : (
          <Folder className="stroke-[1.5px]" />
        )}
        <ThemedSpan className="text-primary block truncate">{node.name}</ThemedSpan>
        <MoreActionsMenu
          triggerClassNames="opacity-0 group-hover/item:opacity-100"
          onDelete={e => {
            e.stopPropagation();
            onDelete();
          }}
          isDeleting={isDeleting}
          onOpenInSidePanel={e => {
            e.stopPropagation();
            onOpenInSidePanel(node.id);
          }}
          onOpenInNewTab={e => {
            e.stopPropagation();
            onOpenInNewTab(node.id);
          }}
        />
      </SidebarMenuButton>
    );
  }

  // For nodes with children (expandable)
  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>div>svg:first-child]:rotate-90"
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <div className="flex items-center gap-1">
          <CollapsibleTrigger asChild>
            <ChevronRight
              className="hover:bg-sidebar-accent cursor-pointer rounded p-1
                transition-transform"
              onClick={e => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
            />
          </CollapsibleTrigger>
          <SidebarMenuButton
            isActive={isActive}
            className="group/item relative cursor-pointer gap-1.5 rounded-sm p-1.5
              group-has-data-[sidebar=menu-action]/menu-item:pr-1.5 hover:pr-8
              data-[active=true]:font-normal"
            onClick={handleClick}
          >
            {node.type === 'chat' ? (
              <MessageSquare className="stroke-[1.5px]" />
            ) : (
              <Folder className="stroke-[1.5px]" />
            )}
            <ThemedSpan className="text-primary block truncate">{node.name}</ThemedSpan>
            <MoreActionsMenu
              triggerClassNames="opacity-0 group-hover/item:opacity-100"
              isDeleting={isDeleting}
              onDelete={onDelete}
              onOpenInSidePanel={e => {
                e.stopPropagation();
                onOpenInSidePanel(node.id);
              }}
              onOpenInNewTab={e => {
                e.stopPropagation();
                onOpenInNewTab(node.id);
              }}
            />
          </SidebarMenuButton>
        </div>
        <CollapsibleContent>
          <SidebarMenuSub className="ml-2.5 pl-3.5">
            {isLoadingChildren && (
              <div className="space-y-2">
                {[...Array(1)].map((_, idx) => (
                  <Skeleton
                    key={idx}
                    className="h-6 w-full rounded"
                  />
                ))}
              </div>
            )}
            {!isLoadingChildren &&
              childNodes?.map(childNode => (
                <TreeNode
                  key={childNode.id}
                  node={childNode}
                  isDeleting={isDeleting}
                  onDelete={onDelete}
                  onOpenInSidePanel={onOpenInSidePanel}
                  onOpenInNewTab={onOpenInNewTab}
                />
              ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};

export default TreeNode;
