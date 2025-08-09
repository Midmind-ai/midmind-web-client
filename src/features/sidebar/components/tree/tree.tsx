/* eslint-disable react-refresh/only-export-components */
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import { ChevronRight, Folder, MessageSquare } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from '@shared/components/ui/sidebar';
import { ThemedSpan } from '@shared/components/ui/themed-span';

import { AppRoutes, SearchParams } from '@shared/constants/router';

import MoreActionsMenu from '@features/sidebar/components/more-actions-menu/more-actions-menu';

export type TreeItem = {
  id: string;
  name: string;
};

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
};

const Tree = ({ item, onDelete, isDeleting }: Props) => {
  const [{ name, id }, ...items] = Array.isArray(item) ? item : [item];
  const navigate = useNavigate();
  const params = useParams();

  if (!items.length) {
    return (
      <SidebarMenuButton
        isActive={id === params.id}
        className="group/item relative cursor-pointer rounded-sm p-1.5 hover:pr-8
          data-[active=true]:font-normal"
        onClick={() =>
          navigate(`${AppRoutes.Chat(id)}?${SearchParams.Model}=gemini-2.0-flash-lite`)
        }
      >
        <MessageSquare className="stroke-[1.5px]" />
        <ThemedSpan className="text-primary block truncate">{name}</ThemedSpan>
        <MoreActionsMenu
          triggerClassNames="opacity-0 group-hover/item:opacity-100"
          onDelete={(e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            onDelete();
          }}
          isDeleting={isDeleting}
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
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree
                key={index}
                item={subItem}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};

export default Tree;
