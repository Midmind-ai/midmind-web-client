import { Folder, MessageSquare } from 'lucide-react';

import type { TreeNode } from '@features/sidebar/hooks/use-tree-data';

import { NODE_STYLES } from './constants';

type Props = {
  nodeType: TreeNode['type'];
};

const NodeIcon = ({ nodeType }: Props) => {
  return nodeType === 'chat' ? (
    <MessageSquare className={NODE_STYLES.icon} />
  ) : (
    <Folder className={NODE_STYLES.icon} />
  );
};

export default NodeIcon;
