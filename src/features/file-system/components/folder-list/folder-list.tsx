import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@components/ui/sidebar';
import { Skeleton } from '@components/ui/skeleton';
import DropZone from '@features/file-system/components/tree-dnd/drop-zone';
import TreeDndProvider from '@features/file-system/components/tree-dnd/tree-dnd-provider';
import TreeNode from '@features/file-system/components/tree-node/tree-node';
import { useFileSystem } from '@features/file-system/data/use-file-system';
import { type DroppableData } from '@features/file-system/hooks/use-file-system.actions';
import { EntityEnum } from '@shared-types/entities';

const FolderList = () => {
  const { treeNodes, isLoading } = useFileSystem();

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
        className="[&::-webkit-scrollbar-thumb]:bg-border/50
          hover:[&::-webkit-scrollbar-thumb]:bg-border/70 flex flex-1 overflow-y-auto
          rounded-none ring-0 [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-track]:bg-transparent"
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
