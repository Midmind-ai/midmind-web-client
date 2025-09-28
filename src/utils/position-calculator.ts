import type { Item } from '@services/items/items-dtos';

/**
 * Standard gap between positions to ensure space for insertions
 */
export const POSITION_GAP = 1000;

/**
 * Calculate position for inserting a new item at a specific index
 * @param siblings - Array of sibling items sorted by position
 * @param insertIndex - Index where the new item should be inserted
 * @returns Position value for the new item
 */
export function calculateInsertPosition(siblings: Item[], insertIndex: number): number {
  // If no siblings, start at default position
  if (siblings.length === 0) {
    return POSITION_GAP;
  }

  // Ensure siblings are sorted by position (descending - newest first)
  const sortedSiblings = [...siblings].sort((a, b) => b.position - a.position);

  // Insert at the beginning (highest position)
  if (insertIndex === 0) {
    const highestPosition = sortedSiblings[0].position;

    return highestPosition + POSITION_GAP;
  }

  // Insert at the end (lowest position)
  if (insertIndex >= sortedSiblings.length) {
    const lowestPosition = sortedSiblings[sortedSiblings.length - 1].position;

    return lowestPosition - POSITION_GAP;
  }

  // Insert between two items
  const beforeIndex = insertIndex - 1;
  const afterIndex = insertIndex;

  const beforePosition = sortedSiblings[beforeIndex].position;
  const afterPosition = sortedSiblings[afterIndex].position;

  return getPositionBetween(beforePosition, afterPosition);
}

/**
 * Calculate position for moving an item during drag-and-drop
 * @param siblings - Array of sibling items (excluding the item being moved)
 * @param newIndex - Target index for the moved item
 * @returns Position value for the moved item
 */
export function calculateMovePosition(siblings: Item[], newIndex: number): number {
  return calculateInsertPosition(siblings, newIndex);
}

/**
 * Calculate position between two existing positions
 * @param beforePos - Position of the item before (higher value)
 * @param afterPos - Position of the item after (lower value)
 * @returns Position value between the two positions
 */
export function getPositionBetween(beforePos: number, afterPos: number): number {
  // Ensure beforePos is higher than afterPos (since we sort DESC)
  if (beforePos <= afterPos) {
    throw new Error('beforePos must be higher than afterPos for DESC ordering');
  }

  const midPosition = (beforePos + afterPos) / 2;

  // Check if we have enough precision for the middle position
  const precision = beforePos - afterPos;
  if (precision < 0.000001) {
    throw new Error('Position precision exhausted - renormalization required');
  }

  return midPosition;
}

/**
 * Convert array index to position for newly loaded items that need initial positions
 * @param index - Array index (0-based)
 * @param totalItems - Total number of items to space out
 * @returns Position value for the item at given index
 */
export function indexToPosition(index: number, totalItems: number): number {
  // Start from highest position and work down
  // This maintains DESC ordering (newest/highest positions first)
  return (totalItems - index) * POSITION_GAP;
}

/**
 * Sort items by position (descending - highest positions first)
 * This matches the backend ordering and ensures consistent UI display
 * @param items - Array of items to sort
 * @returns Sorted array (does not mutate original)
 */
export function sortItemsByPosition(items: Item[]): Item[] {
  return [...items].sort((a, b) => b.position - a.position);
}

/**
 * Find the index where an item should be inserted to maintain position order
 * @param items - Array of items sorted by position (descending)
 * @param targetPosition - Position of the item to insert
 * @returns Index where the item should be inserted
 */
export function findInsertIndex(items: Item[], targetPosition: number): number {
  // Binary search to find insertion point
  let left = 0;
  let right = items.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    // Since items are sorted DESC, we want to find where targetPosition fits
    if (items[mid].position > targetPosition) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

/**
 * Insert before a specific item with precise position calculation
 * @param targetItem - The item to insert before
 * @param siblings - Array of sibling items (excluding the item being moved)
 * @returns Position value for inserting before the target item
 */
export function insertBefore(targetItem: Item, siblings: Item[]): number {
  const sortedSiblings = [...siblings].sort((a, b) => b.position - a.position);
  const targetIndex = sortedSiblings.findIndex(s => s.id === targetItem.id);

  if (targetIndex === 0) {
    // First item - insert with higher position (appears at top)
    return targetItem.position + POSITION_GAP;
  }

  const prevItem = sortedSiblings[targetIndex - 1];

  return getPositionBetween(prevItem.position, targetItem.position);
}

/**
 * Insert after a specific item with precise position calculation
 * @param targetItem - The item to insert after
 * @param siblings - Array of sibling items (excluding the item being moved)
 * @returns Position value for inserting after the target item
 */
export function insertAfter(targetItem: Item, siblings: Item[]): number {
  const sortedSiblings = [...siblings].sort((a, b) => b.position - a.position);
  const targetIndex = sortedSiblings.findIndex(s => s.id === targetItem.id);

  if (targetIndex === sortedSiblings.length - 1) {
    // Last item - insert with lower position (appears at bottom)
    return targetItem.position - POSITION_GAP;
  }

  const nextItem = sortedSiblings[targetIndex + 1];

  return getPositionBetween(targetItem.position, nextItem.position);
}

/**
 * Calculate position for precise index-based insertion
 * @param siblings - Array of sibling items sorted by position
 * @param targetIndex - Index where the item should be inserted
 * @returns Position value for the item at the target index
 */
export function insertAtIndex(siblings: Item[], targetIndex: number): number {
  const sortedSiblings = [...siblings].sort((a, b) => b.position - a.position);

  if (targetIndex === 0) {
    return calculateInsertPosition(sortedSiblings, 0);
  }

  if (targetIndex >= sortedSiblings.length) {
    return calculateInsertPosition(sortedSiblings, sortedSiblings.length);
  }

  return calculateInsertPosition(sortedSiblings, targetIndex);
}

/**
 * Check if positions are getting too close and may need renormalization
 * @param positions - Array of position values
 * @returns True if precision is getting low
 */
export function shouldRenormalize(positions: number[]): boolean {
  if (positions.length < 2) return false;

  const sortedPositions = [...positions].sort((a, b) => b - a);

  for (let i = 0; i < sortedPositions.length - 1; i++) {
    const gap = sortedPositions[i] - sortedPositions[i + 1];
    if (gap < 0.01) {
      // Very small gap suggests precision issues
      return true;
    }
  }

  return false;
}
