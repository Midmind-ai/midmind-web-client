import {
  AsteriskIcon,
  BoxIcon,
  BoxSelectIcon,
  CodeXml,
  CommandIcon,
  FolderIcon,
  GitMergeIcon,
  MessageSquare,
  Text,
  type LucideProps,
} from 'lucide-react';

import { EntityEnum, type EntityType } from '@/shared/types/entity';

export const renderEntityIcon = (
  type: EntityType,
  size: string = 'size-3.5',
  iconProps?: LucideProps
) => {
  const icons: Record<EntityType, React.ReactElement> = {
    [EntityEnum.Workspace]: (
      <CommandIcon
        className={size}
        {...iconProps}
      />
    ),
    [EntityEnum.Folder]: (
      <FolderIcon
        className={size}
        {...iconProps}
      />
    ),
    [EntityEnum.Mindlet]: (
      <BoxIcon
        className={size}
        color="green"
        {...iconProps}
      />
    ),
    [EntityEnum.Map]: (
      <BoxSelectIcon
        className={size}
        {...iconProps}
      />
    ),
    [EntityEnum.RootChat]: (
      <AsteriskIcon
        className={size}
        {...iconProps}
      />
    ),
    [EntityEnum.BranchChat]: (
      <GitMergeIcon
        className={size}
        {...iconProps}
      />
    ),
    [EntityEnum.Chat]: (
      <MessageSquare
        className={size}
        {...iconProps}
      />
    ),
    [EntityEnum.Note]: (
      <Text
        className={size}
        {...iconProps}
      />
    ),
    [EntityEnum.Prompt]: (
      <CodeXml
        className={size}
        {...iconProps}
      />
    ),
  };

  return icons[type];
};
