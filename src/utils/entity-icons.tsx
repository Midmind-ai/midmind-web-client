import {
  // AsteriskIcon,
  BoxIcon,
  // BoxSelectIcon,
  // CodeXml,
  // CommandIcon,
  FolderIcon,
  GitBranchIcon,
  MessageSquare,
  // Text,
  type LucideProps,
} from 'lucide-react';

import type { EntityType } from '@shared-types/entity';

export const renderEntityIcon = (
  type: EntityType,
  size: string = 'size-3.5',
  iconProps?: LucideProps
) => {
  const icons: Record<EntityType, React.ReactElement> = {
    // workspace: (
    //   <CommandIcon
    //     className={size}
    //     {...iconProps}
    //   />
    // ),
    folder: (
      <FolderIcon
        className={size}
        {...iconProps}
      />
    ),
    mindlet: (
      <BoxIcon
        className={size}
        color="oklch(62.7% 0.194 149.214)"
        {...iconProps}
      />
    ),
    // map: (
    //   <BoxSelectIcon
    //     className={size}
    //     {...iconProps}
    //   />
    // ),
    // rootChat: (
    //   <AsteriskIcon
    //     className={size}
    //     {...iconProps}
    //   />
    // ),
    chat: (
      <MessageSquare
        className={size}
        {...iconProps}
      />
    ),
    nested_chat: (
      <GitBranchIcon
        className={size}
        {...iconProps}
      />
    ),
    // note: (
    //   <Text
    //     className={size}
    //     {...iconProps}
    //   />
    // ),
    // prompt: (
    //   <CodeXml
    //     className={size}
    //     {...iconProps}
    //   />
    // ),
  };

  return icons[type];
};
