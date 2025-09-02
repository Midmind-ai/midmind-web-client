import { useCallback } from 'react';

import ExpandableNode from '@features/file-system/components/tree-node/components/expandable-node';
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
  const handleClick = useCallback(() => handleNodeClick(node), [node, handleNodeClick]);

  const setIsOpen = useCallback(
    (open: boolean) => {
      setExpanded(node.id, open);
    },
    [setExpanded, node.id]
  );

  // // For leaf nodes (only for future entity types - directories and chats are always expandable)
  // if () {
  //   return (
  //     <LeafNode
  //       node={node}
  //       isActive={isActive}
  //       onClick={handleClick}
  //     />
  //   );
  // }

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
