/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';

import { ChevronRight, Folder, Loader2Icon, MessagesSquare, MoreHorizontal } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@shared/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from '@shared/components/ui/sidebar';

import { Skeleton } from '@/shared/components/Skeleton';
import { AppRoutes, SearchParams } from '@/shared/constants/router';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../shared/components/DropdownMenu';
import { useSidebarContentLogic } from '../Sidebar/components/SidebarContent/useSidebarContentLogic';

import TreeActions from './tree-actions';

type TreeItem = {
  id: string;
  name: string;
};
type DataType = {
  tree: TreeType;
};
type TreeType = Array<TreeItem | TreeType>;

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { chats, isLoading } = useSidebarContentLogic();

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <TreeActions />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading && (
                <div className="mt-2 space-y-2">
                  {[...Array(4)].map((_, idx) => (
                    <Skeleton
                      key={idx}
                      className="h-6 w-full rounded"
                    />
                  ))}
                </div>
              )}

              {!isLoading &&
                chats?.map((item, index) => (
                  <Tree
                    key={index}
                    item={item as TreeItem}
                  />
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function Tree({ item }: { item: TreeItem }) {
  const [{ name, id }, ...items] = Array.isArray(item) ? item : [item];
  const navigate = useNavigate();
  const params = useParams();

  if (!items.length) {
    return (
      <SidebarMenuButton
        isActive={id === params.id}
        className="data-[active=true]:bg-transparent relative group/item hover:pr-8"
        onClick={() =>
          navigate(`${AppRoutes.Chat(id)}?${SearchParams.Model}=gemini-2.0-flash-lite`)
        }
      >
        <MessagesSquare />
        <span className="truncate block">{name}</span>

        <Dropdown
          id={id}
          triggerClassNames={`opacity-0 group-hover/item:opacity-100`}
        />
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={name === 'components' || name === 'ui'}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="group/item hover:pr-8">
            <ChevronRight className="transition-transform" />
            <Folder />
            <span className="truncate block">{name}</span>
            <Dropdown
              id={id}
              triggerClassNames={`opacity-0 group-hover/item:opacity-100`}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree
                key={index}
                item={subItem}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

const openInNewTab = (path: string) => {
  const fullUrl = `${window.location.origin}${path}`;
  window.open(fullUrl, '_blank', 'noopener,noreferrer');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Dropdown({ id, ...props }: { id: string; [key: string]: any }) {
  const { isDeleting, handleDelete } = useSidebarContentLogic();

  const handleOpenInNewTab = () => {
    const path = `${AppRoutes.Chat(id)}?${SearchParams.Model}=gemini-2.0-flash-lite`;
    openInNewTab(path);
  };

  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction className={props.triggerClassNames}>
          <MoreHorizontal />
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
      >
        <DropdownMenuItem onClick={handleOpenInNewTab}>
          <span>Open in new tab</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(id)}>
          {isDeleting && <Loader2Icon className="animate-spin" />}
          <span className="text-destructive">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
