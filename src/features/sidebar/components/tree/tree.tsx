/* eslint-disable react-refresh/only-export-components */
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
import { ThemedSpan } from '@shared/components/ui/themed-span';

import type { TreeItem } from '@shared/types/entities';

import MoreActionsMenu from '@features/sidebar/components/more-actions-menu/more-actions-menu';
import { useTreeLogic } from '@features/sidebar/components/tree/use-tree-logic';

export type DataType = {
  tree: TreeType;
};

export type TreeType = Array<TreeItem | TreeType>;

// This is sample data.
export const sampleData: DataType = {
  tree: [
    [
      { id: '1', name: 'shared' },
      [
        { id: '2', name: 'prompts' },
        [{ id: '3', name: 'basic' }, [{ id: '4', name: 'default' }]],
        { id: '5', name: 'how to' },
        { id: '6', name: 'layout' },
        [{ id: '7', name: 'blog' }, [{ id: '8', name: 'page' }]],
      ],
    ],
    { id: '9', name: 'chat' },
  ],
};

type Props = {
  item: TreeItem;
  onDelete: VoidFunction;
  isDeleting: boolean;
  onOpenInSidePanel: (chatId: string) => void;
  onOpenInNewTab: (chatId: string) => void;
};

const Tree = ({
  item,
  onDelete,
  isDeleting,
  onOpenInSidePanel,
  onOpenInNewTab,
}: Props) => {
  const { name, id, items, handleOpenChat, isActive } = useTreeLogic(item);

  if (!items.length) {
    return (
      <SidebarMenuButton
        isActive={isActive}
        className="group/item relative cursor-pointer rounded-sm p-1.5 hover:pr-8
          data-[active=true]:font-normal"
        onClick={handleOpenChat}
      >
        <MessageSquare className="stroke-[1.5px]" />
        <ThemedSpan className="text-primary block truncate">{name}</ThemedSpan>
        <MoreActionsMenu
          triggerClassNames="opacity-0 group-hover/item:opacity-100"
          onDelete={e => {
            e.stopPropagation();
            onDelete();
          }}
          isDeleting={isDeleting}
          onOpenInSidePanel={e => {
            e.stopPropagation();
            onOpenInSidePanel(id);
          }}
          onOpenInNewTab={e => {
            e.stopPropagation();
            onOpenInNewTab(id);
          }}
        />
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible
          [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={name === 'components' || name === 'ui'}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="group/item hover:pr-8">
            <ChevronRight className="transition-transform" />
            <Folder />
            <span className="block truncate">{name}</span>
            <MoreActionsMenu
              triggerClassNames="opacity-0 group-hover/item:opacity-100"
              isDeleting={isDeleting}
              onDelete={onDelete}
              onOpenInSidePanel={e => {
                e.stopPropagation();
                onOpenInSidePanel(id);
              }}
              onOpenInNewTab={e => {
                e.stopPropagation();
                onOpenInNewTab(id);
              }}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree
                key={index}
                item={subItem}
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

export default Tree;
