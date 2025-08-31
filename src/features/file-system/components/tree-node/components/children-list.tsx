import { SidebarMenuSub } from '@components/ui/sidebar';
import { Skeleton } from '@components/ui/skeleton';

import { SKELETON_COUNT } from '@features/file-system/components/tree-node/constants';
import {
  useFileSystemData,
  type TreeNode as TreeNodeType,
} from '@features/file-system/data/use-file-system.data';

import type { EntityEnum } from '@shared-types/entities';

type Props = {
  parentNodeId: string;
  parentNodeType: EntityEnum;
  TreeNodeComponent: React.ComponentType<{
    node: TreeNodeType;
  }>;
};

const ChildrenList = ({ parentNodeId, parentNodeType, TreeNodeComponent }: Props) => {
  const { treeNodes: childNodes, isLoading: isLoadingChildren } = useFileSystemData(
    parentNodeId,
    parentNodeType
  );

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
