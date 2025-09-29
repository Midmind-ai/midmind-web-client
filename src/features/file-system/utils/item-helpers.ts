import type { Item } from '@services/items/items-dtos';
import { ItemTypeEnum } from '@services/items/items-dtos';

/**
 * Extract display name from Item payload
 */
export const getItemDisplayName = (item: Item): string => {
  return item.payload?.name || `Untitled ${item.type}`;
};

/**
 * Get parent ID from Item
 */
export const getItemParentId = (item: Item): string | null => {
  return item.parent_id;
};

/**
 * Convert ItemType to EntityEnum for backward compatibility
 */
export const getItemEntityType = (item: Item): ItemTypeEnum => {
  if (typeof item.type === 'string') {
    switch (item.type) {
      case ItemTypeEnum.Folder:
        return ItemTypeEnum.Folder;
      case ItemTypeEnum.Chat:
        return ItemTypeEnum.Chat;
      case ItemTypeEnum.Note:
        return ItemTypeEnum.Note;
      default:
        return item.type as ItemTypeEnum;
    }
  }

  return item.type as ItemTypeEnum;
};

/**
 * Check if item has children (for expandable state)
 * Note: This will be determined by server data/state in practice
 */
export const getItemHasChildren = (item: Item): boolean => {
  // All item types can have children - notes can have chats for context, etc.
  const entityType = getItemEntityType(item);

  return (
    entityType === ItemTypeEnum.Folder ||
    entityType === ItemTypeEnum.Project ||
    entityType === ItemTypeEnum.Note ||
    entityType === ItemTypeEnum.Prompt ||
    entityType === ItemTypeEnum.Chat
  );
};

/**
 * Get legacy parent directory ID for backward compatibility with DnD
 */
export const getItemParentDirectoryId = (item: Item): string | null => {
  // For backward compatibility, assume parent_id is always the directory parent
  // This might need refinement based on actual usage patterns
  return item.parent_id;
};

/**
 * Get legacy parent chat ID for backward compatibility with DnD
 */
export const getItemParentChatId = (_item: Item): string | null => {
  // For chat branching, this would be different from parent_id
  // For now, return null - this will need proper implementation if chat branching is active
  return null;
};
