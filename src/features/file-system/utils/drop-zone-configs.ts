import { ItemTypeEnum } from '@services/items/items-dtos';

/**
 * Centralized configuration for drop zones in the file system
 * This ensures consistent behavior across all drag and drop operations
 */

// All moveable item types that can be dragged
export const DRAGGABLE_TYPES = [
  ItemTypeEnum.Chat,
  ItemTypeEnum.Folder,
  ItemTypeEnum.Note,
  ItemTypeEnum.Project,
] as const;

// Drop zone configurations
export const DROP_ZONE_CONFIGS = {
  /**
   * Root drop zone - accepts items to move to root level (null parent)
   */
  root: {
    accepts: DRAGGABLE_TYPES,
    description: 'Root level - accepts all item types',
  },

  /**
   * Expandable node drop zone - accepts items to move inside folders
   */
  expandableNode: {
    accepts: DRAGGABLE_TYPES,
    description: 'Folder contents - accepts all item types',
  },
} as const;

/**
 * Helper function to check if a drop target accepts a specific item type
 */
export const canDropItemType = (
  dropZoneType: keyof typeof DROP_ZONE_CONFIGS,
  itemType: ItemTypeEnum
): boolean => {
  return DROP_ZONE_CONFIGS[dropZoneType].accepts.includes(itemType);
};

/**
 * Get accepted types for a specific drop zone
 */
export const getAcceptedTypes = (
  dropZoneType: keyof typeof DROP_ZONE_CONFIGS
): ItemTypeEnum[] => {
  return [...DROP_ZONE_CONFIGS[dropZoneType].accepts];
};
