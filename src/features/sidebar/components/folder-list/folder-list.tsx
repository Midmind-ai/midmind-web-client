import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@components/ui/sidebar';
import { Skeleton } from '@components/ui/skeleton';

import { useFolderListLogic } from '@features/sidebar/components/folder-list/use-folder-list-logic';
import TreeNode from '@features/sidebar/components/tree-node/tree-node';

const FolderList = () => {
  const {
    treeNodes,
    isLoading,
    isDeleting,
    handleDelete,
    handleRename,
    openChatInNewTab,
    openChatInSidePanel,
  } = useFolderListLogic();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-[2px]">
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
            treeNodes?.map(node => (
              <TreeNode
                key={node.id}
                node={node}
                isDeleting={isDeleting}
                onDelete={handleDelete}
                onRename={handleRename}
                onOpenInNewTab={() => openChatInNewTab(node.id)}
                onOpenInSidePanel={() => openChatInSidePanel(node.id)}
              />
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default FolderList;
