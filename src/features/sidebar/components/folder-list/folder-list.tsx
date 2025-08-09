import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from '@shared/components/ui/sidebar';
import { Skeleton } from '@shared/components/ui/skeleton';

import type { TreeItem } from '@shared/types/entities';

import { useFolderListLogic } from '@features/sidebar/components/folder-list/use-folder-list-logic';
import Tree from '@features/sidebar/components/tree/tree';

const FolderList = () => {
  const {
    chats,
    isLoading,
    isDeleting,
    handleDelete,
    openChatInNewTab,
    openChatInSidePanel,
  } = useFolderListLogic();

  return (
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
                isDeleting={isDeleting}
                onDelete={() => handleDelete(item.id)}
                onOpenInNewTab={() => openChatInNewTab(item.id)}
                onOpenInSidePanel={() => openChatInSidePanel(item.id)}
              />
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default FolderList;
