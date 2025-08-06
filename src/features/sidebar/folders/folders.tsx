import { Skeleton } from '@/shared/components/Skeleton';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from '@/shared/components/ui/sidebar';

import { useSidebarContentLogic } from '../use-sidebar-content-logic';

import FoldersActions from './folder-actions';
import { Tree, type TreeItem } from './tree';

export default function Folders() {
  const { chats, isLoading } = useSidebarContentLogic();

  return (
    <SidebarContent className="gap-0">
      <FoldersActions />
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
  );
}
