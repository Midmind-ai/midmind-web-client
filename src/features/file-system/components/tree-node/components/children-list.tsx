import React from 'react';
import { useFileSystem } from '../../../data/use-file-system';
import { SidebarMenuSub } from '@components/ui/sidebar';
import { Skeleton } from '@components/ui/skeleton';
import { SKELETON_COUNT } from '@features/file-system/components/tree-node/constants';
import type { Item } from '@services/items/items-dtos';

type Props = {
  parentNodeId: string;
  TreeNodeComponent: React.ComponentType<{ node: Item }>;
};

const ChildrenList = React.memo(({ parentNodeId, TreeNodeComponent }: Props) => {
  const { items: childNodes, isLoading } = useFileSystem(parentNodeId);

  return (
    <SidebarMenuSub className="ml-3.5 pt-0 pb-0 pl-3.5">
      {isLoading && (
        <div className="">
          {[...Array(SKELETON_COUNT)].map((_, idx) => (
            <Skeleton
              key={idx}
              className="h-6 w-full rounded"
            />
          ))}
        </div>
      )}
      {!isLoading && childNodes && childNodes.length > 0 && (
        <div className="">
          {childNodes.map(childNode => (
            <TreeNodeComponent
              key={childNode.id}
              node={childNode}
            />
          ))}
        </div>
      )}
      {!isLoading && (!childNodes || childNodes.length === 0) && (
        <div
          className="text-muted-foreground flex h-7 items-center justify-start px-2
            text-sm opacity-45"
        >
          Empty
        </div>
      )}
    </SidebarMenuSub>
  );
});

export default ChildrenList;
