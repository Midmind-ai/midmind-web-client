import { useEffect } from 'react';

import {
  subscribeToBranchCreated,
  unsubscribeFromBranchCreated,
} from '@features/chat/utils/branch-creation-emitter';
import type { BranchEvent } from '@features/chat/utils/branch-creation-emitter';
import { useTreeNodeLogic } from '@features/sidebar/components/tree-node/use-tree-node-logic';
import type { TreeNode as TreeNodeType } from '@features/sidebar/hooks/use-tree-data';
import { useExpandedNodesStore } from '@features/sidebar/stores/use-expanded-nodes-store';

import ExpandableNode from './expandable-node';
import LeafNode from './leaf-node';

type Props = {
  node: TreeNodeType;
  onDelete: VoidFunction;
  isDeleting: boolean;
  onOpenInSidePanel: (id: string) => void;
  onOpenInNewTab: (id: string) => void;
};

const TreeNode = ({
  node,
  onDelete,
  isDeleting,
  onOpenInSidePanel,
  onOpenInNewTab,
}: Props) => {
  const { isExpanded, setExpanded } = useExpandedNodesStore();
  const isOpen = isExpanded(node.id);

  const { isActive, handleClick, childNodes, isLoadingChildren } = useTreeNodeLogic(
    node,
    isOpen
  );

  const setIsOpen = (open: boolean) => {
    setExpanded(node.id, open);
  };

  // Listen for branch creation events to auto-expand parent chats
  useEffect(() => {
    const handleBranchCreated = (event: BranchEvent) => {
      if (event.branchContext.parent_chat_id === node.id) {
        // Auto-expand this node when a branch is added to it
        setExpanded(node.id, true);
      }
    };

    subscribeToBranchCreated(handleBranchCreated);

    return () => {
      unsubscribeFromBranchCreated(handleBranchCreated);
    };
  }, [node.id, setExpanded]);

  // For leaf nodes (chats without children or directories without children)
  if (!node.hasChildren) {
    return (
      <LeafNode
        node={node}
        isActive={isActive}
        isDeleting={isDeleting}
        onDelete={onDelete}
        onOpenInSidePanel={onOpenInSidePanel}
        onOpenInNewTab={onOpenInNewTab}
        onClick={handleClick}
      />
    );
  }

  // For nodes with children (expandable)
  return (
    <ExpandableNode
      node={node}
      isActive={isActive}
      isDeleting={isDeleting}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      childNodes={childNodes}
      isLoadingChildren={isLoadingChildren}
      onDelete={onDelete}
      onOpenInSidePanel={onOpenInSidePanel}
      onOpenInNewTab={onOpenInNewTab}
      onClick={handleClick}
      TreeNodeComponent={TreeNode}
    />
  );
};

export default TreeNode;
