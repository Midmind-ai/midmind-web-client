import { SidebarMenuSub } from '@components/ui/sidebar';
import { Skeleton } from '@components/ui/skeleton';

import { SKELETON_COUNT } from '@features/file-system/components/tree-node/logic/constants';
import type { TreeNode as TreeNodeType } from '@features/file-system/hooks/use-tree-data';

import { useFolderListLogic } from '../../folder-list/use-folder-list-logic';

type Props = {
  isLoadingChildren: boolean;
  childNodes?: TreeNodeType[];
  isDeleting: boolean;
  onRename?: VoidFunction;
  onOpenInSidePanel: (id: string) => void;
  onOpenInNewTab: (id: string) => void;
  TreeNodeComponent: React.ComponentType<{
    node: TreeNodeType;
    isDeleting: boolean;
    onDelete: VoidFunction;
    onRename?: VoidFunction;
    onOpenInSidePanel: (id: string) => void;
    onOpenInNewTab: (id: string) => void;
  }>;
};

const ChildrenList = ({
  isLoadingChildren,
  childNodes,
  isDeleting,
  onRename,
  onOpenInSidePanel,
  onOpenInNewTab,
  TreeNodeComponent,
}: Props) => {
  const { handleDelete } = useFolderListLogic();

  return (
    <SidebarMenuSub className="ml-3.5 pb-0 pl-3.5">
      {isLoadingChildren && (
        <div className="space-y-2">
          {[...Array(SKELETON_COUNT)].map((_, idx) => (
            <Skeleton
              key={idx}
              className="h-6 w-full rounded"
            />
          ))}
        </div>
      )}
      {!isLoadingChildren &&
        childNodes &&
        childNodes.length > 0 &&
        childNodes.map(childNode => (
          <TreeNodeComponent
            key={childNode.id}
            node={childNode}
            isDeleting={isDeleting}
            onDelete={() => handleDelete(childNode.id)}
            onRename={onRename}
            onOpenInSidePanel={onOpenInSidePanel}
            onOpenInNewTab={onOpenInNewTab}
          />
        ))}
      {!isLoadingChildren && (!childNodes || childNodes.length === 0) && (
        <div className="text-muted-foreground ml-3 px-2 py-1 text-sm opacity-45">
          Empty
        </div>
      )}
    </SidebarMenuSub>
  );
};

export default ChildrenList;
