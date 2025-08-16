import { useEffect } from 'react';

import {
  subscribeToBranchCreated,
  unsubscribeFromBranchCreated,
} from '@features/chat/utils/branch-creation-emitter';
import type { BranchEvent } from '@features/chat/utils/branch-creation-emitter';
import { useTreeNodeLogic } from '@features/file-system/components/tree-node/logic/use-tree-node-logic';
import ExpandableNode from '@features/file-system/components/tree-node/rendering/expandable-node';
import LeafNode from '@features/file-system/components/tree-node/rendering/leaf-node';
import type { TreeNode as TreeNodeType } from '@features/file-system/hooks/use-tree-data';
import { useExpandedNodesStore } from '@features/file-system/stores/use-expanded-nodes-store';

type Props = {
  node: TreeNodeType;
  onRename?: (id: string) => void;
  onOpenInSidePanel: (id: string) => void;
  onOpenInNewTab: (id: string) => void;
};

const TreeNode = ({ node, onRename, onOpenInSidePanel, onOpenInNewTab }: Props) => {
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

  // For leaf nodes (only for future entity types - directories and chats are always expandable)
  if (!node.hasChildren && node.type !== 'directory' && node.type !== 'chat') {
    return (
      <LeafNode
        node={node}
        isActive={isActive}
        onOpenInSidePanel={onOpenInSidePanel}
        onOpenInNewTab={onOpenInNewTab}
        onClick={handleClick}
      />
    );
  }

  // For expandable nodes (directories and chats are always expandable)
  return (
    <ExpandableNode
      node={node}
      isActive={isActive}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      childNodes={childNodes}
      isLoadingChildren={isLoadingChildren}
      onRename={onRename}
      onOpenInSidePanel={onOpenInSidePanel}
      onOpenInNewTab={onOpenInNewTab}
      onClick={handleClick}
      TreeNodeComponent={TreeNode}
    />
  );
};

export default TreeNode;
