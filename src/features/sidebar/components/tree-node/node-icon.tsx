import { Folder, MessageSquare, MessagesSquare } from 'lucide-react';

import type { TreeNode } from '@features/sidebar/hooks/use-tree-data';

type Props = {
  nodeType: TreeNode['type'];
};

const NodeIcon = ({ nodeType }: Props) => {
  if (nodeType === 'chat') {
    return <MessageSquare className="size-4 stroke-[1.5px]" />;
  }

  if (nodeType === 'chats') {
    return <MessagesSquare className="size-4 stroke-[1.5px]" />;
  }

  return <Folder className="size-4 stroke-[1.5px]" />;
};

export default NodeIcon;
