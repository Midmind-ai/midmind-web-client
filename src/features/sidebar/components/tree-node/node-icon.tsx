import { Folder, MessageCircle, MessagesSquare } from 'lucide-react';

import type { TreeNode } from '@features/sidebar/hooks/use-tree-data';

type Props = {
  nodeType: TreeNode['type'];
  hasChildren?: boolean;
};

const NodeIcon = ({ nodeType, hasChildren }: Props) => {
  if (nodeType === 'chat') {
    // Show MessagesSquare for chats with branches, MessageCircle for single chats
    return hasChildren ? (
      <MessagesSquare className="size-4 stroke-[1.5px]" />
    ) : (
      <MessageCircle className="size-4 stroke-[1.5px]" />
    );
  }

  if (nodeType === 'chats') {
    return <MessagesSquare className="size-4 stroke-[1.5px]" />;
  }

  if (nodeType === 'directory') {
    return <Folder className="size-4 stroke-[1.5px]" />;
  }

  return <Folder className="size-4 stroke-[1.5px]" />;
};

export default NodeIcon;
