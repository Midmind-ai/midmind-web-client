import { Folder, MessageCircle, MessagesSquare } from 'lucide-react';
import type { TreeNode } from '@features/file-system/hooks/use-file-system.actions';
import { EntityEnum } from '@shared-types/entities';

type Props = {
  nodeType: TreeNode['type'];
  hasChildren?: boolean;
};

const NodeIcon = ({ nodeType, hasChildren }: Props) => {
  if (nodeType === EntityEnum.Chat) {
    // Show MessagesSquare for chats with branches, MessageCircle for single chats
    return hasChildren ? (
      <MessagesSquare className="size-4 stroke-[1.5px]" />
    ) : (
      <MessageCircle className="size-4 stroke-[1.5px]" />
    );
  }

  if (nodeType === EntityEnum.Folder || nodeType === EntityEnum.Mindlet) {
    return <Folder className="size-4 stroke-[1.5px]" />;
  }

  // Default fallback
  return <Folder className="size-4 stroke-[1.5px]" />;
};

export default NodeIcon;
