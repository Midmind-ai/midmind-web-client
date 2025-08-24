import ExpandableNode from '@features/file-system/components/tree-node/components/expandable-node';
import LeafNode from '@features/file-system/components/tree-node/components/leaf-node';
import {
  useFileSystemActions,
  type TreeNode as TreeNodeType,
} from '@features/file-system/use-file-system.actions';

type Props = {
  node: TreeNodeType;
};

const TreeNode = ({ node }: Props) => {
  const { isExpanded, isNodeActive, handleNodeClick } = useFileSystemActions().helpers;
  const { setExpanded } = useFileSystemActions().actions;
  const isOpen = isExpanded(node.id);
  const isActive = isNodeActive(node);
  const handleClick = () => handleNodeClick(node);

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
      onClick={handleClick}
      TreeNodeComponent={TreeNode}
    />
  );
};

export default TreeNode;
