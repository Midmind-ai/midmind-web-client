import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@components/ui/sidebar';
import { Skeleton } from '@components/ui/skeleton';
import DropZone from '@features/file-system/components/tree-dnd/drop-zone';
import TreeDndProvider from '@features/file-system/components/tree-dnd/tree-dnd-provider';
import TreeNode from '@features/file-system/components/tree-node/tree-node';
import { useFileSystemData } from '@features/file-system/data/use-file-system.data';
import { type DroppableData } from '@features/file-system/hooks/use-file-system.actions';
import { EntityEnum } from '@shared-types/entities';

const FolderList = () => {
  const { treeNodes, isLoading } = useFileSystemData();

  // Root drop zone configuration - accepts items to move to root level (null parent)
  const rootDroppableData: DroppableData = {
    type: 'root',
    id: 'root-drop-zone',
    nodeType: EntityEnum.Folder,
    accepts: [EntityEnum.Chat, EntityEnum.Folder], // Root can accept both chats and directories
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
