import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@shared/components/ui/sidebar';
import { Skeleton } from '@shared/components/ui/skeleton';

import { useFolderListLogic } from '@features/sidebar/components/folder-list/use-folder-list-logic';
import Tree, { type TreeItem } from '@features/sidebar/components/tree/tree';

const FolderList = () => {
  const { chats, isLoading, isDeleting, handleDelete } = useFolderListLogic();

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
                onDelete={() => handleDelete(item.id)}
                isDeleting={isDeleting}
              />
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default FolderList;
