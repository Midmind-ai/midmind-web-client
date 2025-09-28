import React from 'react';
import { cn } from '../../../../../utils/cn';
import { PROJECT_BORDER_COLOR } from '../../../constants/colors';
import { useFileSystem } from '../../../data/use-file-system';
import { SidebarMenuSub } from '@components/ui/sidebar';
import { Skeleton } from '@components/ui/skeleton';
import { SKELETON_COUNT } from '@features/file-system/components/tree-node/constants';
import type { Item } from '@services/items/items-dtos';

type Props = {
  parentNodeId: string;
  isProjectChildrenList: boolean;
  TreeNodeComponent: React.ComponentType<{ node: Item }>;
};

const ChildrenList = React.memo(
  ({ parentNodeId, isProjectChildrenList, TreeNodeComponent }: Props) => {
    const { items: childNodes, isLoading } = useFileSystem(parentNodeId);

    return (
      <SidebarMenuSub
        className={cn(
          'ml-3.5 pt-0 pb-0 pl-3.5',
          isProjectChildrenList ? `${PROJECT_BORDER_COLOR} border-l-1 border-dashed` : ''
        )}
      >
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
  }
);

export default ChildrenList;
