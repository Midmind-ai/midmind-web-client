import { SidebarMenuSub } from '@shared/components/ui/sidebar';
import { Skeleton } from '@shared/components/ui/skeleton';

import type { TreeNode as TreeNodeType } from '@features/sidebar/hooks/use-tree-data';

import { NODE_STYLES, SKELETON_COUNT } from './constants';

type Props = {
  isLoadingChildren: boolean;
  childNodes?: TreeNodeType[];
  isDeleting: boolean;
  onDelete: VoidFunction;
  onOpenInSidePanel: (id: string) => void;
  onOpenInNewTab: (id: string) => void;
  TreeNodeComponent: React.ComponentType<{
    node: TreeNodeType;
    isDeleting: boolean;
    onDelete: VoidFunction;
    onOpenInSidePanel: (id: string) => void;
    onOpenInNewTab: (id: string) => void;
  }>;
};

const ChildrenList = ({
  isLoadingChildren,
  childNodes,
  isDeleting,
  onDelete,
  onOpenInSidePanel,
  onOpenInNewTab,
  TreeNodeComponent,
}: Props) => {
  return (
    <SidebarMenuSub className={NODE_STYLES.childrenContainer}>
      {isLoadingChildren && (
        <div className={NODE_STYLES.loadingContainer}>
          {[...Array(SKELETON_COUNT)].map((_, idx) => (
            <Skeleton
              key={idx}
              className="h-6 w-full rounded"
            />
          ))}
        </div>
      )}
      {!isLoadingChildren &&
        childNodes?.map(childNode => (
          <TreeNodeComponent
            key={childNode.id}
            node={childNode}
            isDeleting={isDeleting}
            onDelete={onDelete}
            onOpenInSidePanel={onOpenInSidePanel}
            onOpenInNewTab={onOpenInNewTab}
          />
        ))}
    </SidebarMenuSub>
  );
};

export default ChildrenList;
