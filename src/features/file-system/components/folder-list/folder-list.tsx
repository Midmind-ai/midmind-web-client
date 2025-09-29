import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@components/ui/sidebar';
import { Skeleton } from '@components/ui/skeleton';
import DropZone from '@features/file-system/components/tree-dnd/drop-zone';
import TreeDndProvider from '@features/file-system/components/tree-dnd/tree-dnd-provider';
import TreeNode from '@features/file-system/components/tree-node/tree-node';
import { useFileSystem } from '@features/file-system/data/use-file-system';
import { type DroppableData } from '@features/file-system/hooks/use-file-system.actions';
import { getAcceptedTypes } from '@features/file-system/utils/drop-zone-configs';
import { ItemTypeEnum } from '@services/items/items-dtos';

const FolderList = () => {
  const { items, isLoading } = useFileSystem();

  // Root drop zone configuration - accepts items to move to root level (null parent)
  const rootDroppableData: DroppableData = {
    type: 'root',
    id: 'root-drop-zone',
    nodeType: ItemTypeEnum.Folder,
    accepts: getAcceptedTypes('root'), // Use centralized configuration
  };

  return (
    <TreeDndProvider>
      <DropZone
        data={rootDroppableData}
        enablePositionDetection={false}
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
              {!isLoading && items && items.length > 0 && (
                <div className="">
                  {items.map(item => (
                    <TreeNode
                      key={item.id}
                      node={item}
                    />
                  ))}
                </div>
              )}
              {!isLoading && (!items || items.length === 0) && (
                <div className="text-muted-foreground ml-3 px-2 py-1 text-sm opacity-45">
                  Empty
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </DropZone>
    </TreeDndProvider>
  );
};

export default FolderList;
