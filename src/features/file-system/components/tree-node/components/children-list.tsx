import React from 'react';
import { SidebarMenuSub } from '@components/ui/sidebar';
import { Skeleton } from '@components/ui/skeleton';
import { SKELETON_COUNT } from '@features/file-system/components/tree-node/constants';
import { useFileSystem } from '@features/file-system/data/use-file-system';
import type { TreeNode as TreeNodeType } from '@features/file-system/data/use-file-system';

type Props = {
  parentNodeId: string;
  TreeNodeComponent: React.ComponentType<{ node: TreeNodeType }>;
};

const ChildrenList = React.memo(({ parentNodeId, TreeNodeComponent }: Props) => {
  const { treeNodes: childNodes, isLoading: isLoadingChildren } =
    useFileSystem(parentNodeId);

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
});

export default ChildrenList;
