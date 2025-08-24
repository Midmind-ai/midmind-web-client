import { useTreeNodeLogic } from '@features/file-system/components/tree-node/logic/use-tree-node-logic';
import ExpandableNode from '@features/file-system/components/tree-node/rendering/expandable-node';
import LeafNode from '@features/file-system/components/tree-node/rendering/leaf-node';
import type { TreeNode as TreeNodeType } from '@features/file-system/hooks/use-tree-data';
import { useTreeData } from '@features/file-system/hooks/use-tree-data';
import { useExpandedNodesStore } from '@features/file-system/stores/use-expanded-nodes-store';

type Props = {
  node: TreeNodeType;
};

const TreeNode = ({ node }: Props) => {
  const { isExpanded, setExpanded } = useExpandedNodesStore();
  const isOpen = isExpanded(node.id);

  const { isActive, handleClick } = useTreeNodeLogic(node);

  // Fetch children only when expanded
  const shouldFetchChildren = isOpen && (node.type === 'directory' || node.hasChildren);
  const { treeNodes: childNodes, isLoading: isLoadingChildren } = useTreeData(
    shouldFetchChildren ? node.id : null,
    shouldFetchChildren ? (node.type === 'chats' ? 'chat' : node.type) : undefined
  );

  const setIsOpen = (open: boolean) => {
    setExpanded(node.id, open);
  };

  // For leaf nodes (only for future entity types - directories and chats are always expandable)
  if (!node.hasChildren && node.type !== 'directory' && node.type !== 'chat') {
    return (
      <LeafNode
        node={node}
        isActive={isActive}
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
      onClick={handleClick}
      TreeNodeComponent={TreeNode}
    />
  );
};

export default TreeNode;
