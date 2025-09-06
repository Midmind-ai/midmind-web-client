import { SidebarMenuButton, SidebarMenuItem } from '@components/ui/sidebar';
import { ThemedSpan } from '@components/ui/themed-span';

import NodeIcon from '@features/file-system/components/tree-node/components/node-icon';
import type { TreeNode } from '@features/file-system/hooks/use-file-system.actions';

type Props = {
  node: TreeNode;
};

const DragOverlayNode = ({ node }: Props) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="bg-sidebar-accent ring-border relative cursor-grabbing gap-1.5
          rounded-sm p-1 pr-8 shadow-lg ring-1"
      >
        <div
          className="flex size-6 flex-shrink-0 items-center justify-center rounded-[4px]
            transition-colors"
        >
          <NodeIcon
            nodeType={node.type}
            hasChildren={node.hasChildren}
          />
        </div>
        <ThemedSpan className="text-primary block truncate">{node.name}</ThemedSpan>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default DragOverlayNode;
