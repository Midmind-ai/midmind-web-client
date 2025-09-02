import type { CollisionDetection, ClientRect } from '@dnd-kit/core';

/**
 * Calculates the intersection ratio between two rectangles using Jaccard index
 * @param entry - The droppable container rectangle
 * @param target - The dragged item rectangle
 * @returns Intersection ratio between 0 and 1
 */
function getIntersectionRatio(entry: ClientRect, target: ClientRect): number {
  const top = Math.max(target.top, entry.top);
  const left = Math.max(target.left, entry.left);
  const right = Math.min(target.left + target.width, entry.left + entry.width);
  const bottom = Math.min(target.top + target.height, entry.top + entry.height);
  const width = Math.abs(right - left);
  const height = Math.abs(bottom - top);

  if (left < right && top < bottom) {
    const targetArea = target.width * target.height;
    const entryArea = entry.width * entry.height;
    const intersectionArea = width * height;
    const intersectionRatio =
      intersectionArea / (targetArea + entryArea - intersectionArea);

    const ratio = Number(intersectionRatio.toFixed(4));

    return ratio;
  }

  return 0;
}

/**
 * Custom collision detection algorithm using intersection ratios
 * Based on GitHub issue #483: https://github.com/clauderic/dnd-kit/issues/483
 *
 * This algorithm:
 * - Calculates actual geometric overlap between dragged item and dropzones
 * - Returns collisions sorted by highest intersection ratio
 * - Handles nested dropzones better than default algorithms
 * - Accounts for scroll positions in containers
 */
export const intersectionRatioCollision: CollisionDetection = args => {
  const { active, droppableContainers } = args;
  const collisions = [];

  const { translated } = active.rect.current;

  if (!translated) return [];

  for (let i = 0; i < droppableContainers.length; i += 1) {
    const droppableContainer = droppableContainers[i];
    const {
      rect: { current: rect },
      node,
    } = droppableContainer;

    if (rect) {
      const computedRect = { ...translated };
      // Account for scroll position in container
      computedRect.top += node.current?.scrollTop || 0;
      computedRect.bottom += node.current?.scrollTop || 0;

      const intersectionRatio = getIntersectionRatio(rect, computedRect);

      if (intersectionRatio > 0) {
        collisions.push({
          id: droppableContainer.id,
          data: {
            droppableContainer,
            value: intersectionRatio,
          },
        });
      }
    }
  }

  // Sort by intersection ratio (highest first) and return array
  return collisions.sort((a, b) => b.data.value - a.data.value);
};
