import { SidebarMenuSub } from '@shared/components/ui/sidebar';
import { Skeleton } from '@shared/components/ui/skeleton';

import type { TreeNode as TreeNodeType } from '@features/sidebar/hooks/use-tree-data';

import { SKELETON_COUNT } from './constants';

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
            onDelete={onDelete}
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
