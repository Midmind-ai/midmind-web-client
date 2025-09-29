import { Folder, Library, MessagesSquare, NotebookText, Wrench } from 'lucide-react';
import { ItemTypeEnum } from '@services/items/items-dtos';

type Props = {
  nodeType: ItemTypeEnum;
  hasChildren?: boolean;
};

const NodeIcon = ({ nodeType }: Props) => {
  if (nodeType === ItemTypeEnum.Chat) {
    return <MessagesSquare className="size-4 stroke-[1.5px]" />;
  }

  if (nodeType === ItemTypeEnum.Folder) {
    return <Folder className="size-4 stroke-[1.5px]" />;
  }

  if (nodeType === ItemTypeEnum.Note) {
    return <NotebookText className="size-4 stroke-[1.5px]" />;
  }

  if (nodeType === ItemTypeEnum.Project) {
    return <Library className="size-4.5 stroke-[1.5px] text-blue-600" />;
  }

  if (nodeType === ItemTypeEnum.Prompt) {
    return <Wrench className="size-4 stroke-[1.5px] text-amber-600" />;
  }

  // Default fallback
  return <Folder className="size-4 stroke-[1.5px]" />;
};

export default NodeIcon;
