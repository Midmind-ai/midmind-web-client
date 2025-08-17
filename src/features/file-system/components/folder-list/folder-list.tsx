import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@components/ui/sidebar';
import { Skeleton } from '@components/ui/skeleton';

import { useFolderListLogic } from '@features/file-system/components/folder-list/use-folder-list-logic';
import DropZone from '@features/file-system/components/tree-dnd/drop-zone';
import TreeDndProvider from '@features/file-system/components/tree-dnd/tree-dnd-provider';
import type { DroppableData } from '@features/file-system/components/tree-dnd/use-tree-dnd-logic';
import TreeNode from '@features/file-system/components/tree-node/tree-node';

const FolderList = () => {
  const { treeNodes, isLoading } = useFolderListLogic();

  // Root drop zone configuration - accepts items to move to root level (null parent)
  const rootDroppableData: DroppableData = {
    type: 'root',
    id: 'root-drop-zone',
    nodeType: 'directory',
    accepts: ['chat', 'directory'], // Root can accept both chats and directories
  };

  return (
    <TreeDndProvider>
      <DropZone
        data={rootDroppableData}
        className="flex flex-1 rounded-none ring-0"
      >
        <SidebarGroup className="flex flex-1">
          <SidebarGroupContent className="flex flex-1">
            <SidebarMenu className="flex flex-1 flex-col gap-[2px]">
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
                  />
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </DropZone>
    </TreeDndProvider>
  );
};

export default FolderList;
