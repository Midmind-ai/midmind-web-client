import { Folder, MessageCircle, MessagesSquare, NotebookText } from 'lucide-react';
import { ItemTypeEnum } from '@services/items/items-dtos';

type Props = {
  nodeType: ItemTypeEnum;
  hasChildren?: boolean;
};

const NodeIcon = ({ nodeType, hasChildren }: Props) => {
  if (nodeType === ItemTypeEnum.Chat) {
    // Show MessagesSquare for chats with branches, MessageCircle for single chats
    return hasChildren ? (
      <MessagesSquare className="size-4 stroke-[1.5px]" />
    ) : (
      <MessageCircle className="size-4 stroke-[1.5px]" />
    );
  }

  if (nodeType === ItemTypeEnum.Folder) {
    return <Folder className="size-4 stroke-[1.5px]" />;
  }

  if (nodeType === ItemTypeEnum.Note) {
    return <NotebookText className="size-4 stroke-[1.5px]" />;
  }

  // Default fallback
  return <Folder className="size-4 stroke-[1.5px]" />;
};

export default NodeIcon;
