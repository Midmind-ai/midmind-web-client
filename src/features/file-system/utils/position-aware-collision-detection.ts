import {
  closestCenter,
  type CollisionDetection,
  type DroppableContainer,
} from '@dnd-kit/core';

export type PositionAwareCollisionData = {
  positionWithinDropZone?: 'before' | 'inside' | 'after';
  relativePosition?: number; // 0-1, where 0 is top and 1 is bottom
};

/**
 * Custom collision detection that extends closestCenter with position-aware detection
 * Calculates where within a drop zone the dragged item is positioned
 */
export const positionAwareCollisionDetection: CollisionDetection = args => {
  const { pointerCoordinates } = args;

  // First get standard collision detection results
  const collisions = closestCenter(args);

  if (!collisions || collisions.length === 0 || !pointerCoordinates) {
    return collisions;
  }

  // Enhance collision data with position information
  const enhancedCollisions = collisions.map(collision => {
    const droppableContainer = args.droppableContainers.find(
      container => container.id === collision.id
    );

    if (!droppableContainer) {
      return collision;
    }

    // Calculate position within the drop zone
    const positionData = calculatePositionWithinDropZone(
      pointerCoordinates,
      droppableContainer
    );

    // Add position data to collision
    return {
      ...collision,
      data: {
        ...(collision.data || {}),
        positionWithinDropZone: positionData.positionWithinDropZone,
        relativePosition: positionData.relativePosition,
      } as PositionAwareCollisionData,
    };
  });

  return enhancedCollisions;
};

/**
 * Calculate position within a drop zone based on pointer coordinates
 */
function calculatePositionWithinDropZone(
  pointerCoordinates: { x: number; y: number },
  droppableContainer: DroppableContainer
): {
  positionWithinDropZone: 'before' | 'inside' | 'after';
  relativePosition: number;
} {
  const rect = droppableContainer.rect.current;

  if (!rect) {
    return {
      positionWithinDropZone: 'inside',
      relativePosition: 0.5,
    };
  }

  // Calculate relative Y position within the drop zone (0 = top, 1 = bottom)
  const relativeY = (pointerCoordinates.y - rect.top) / rect.height;
  const clampedY = Math.max(0, Math.min(1, relativeY));

  // Define threshold zones
  const BEFORE_THRESHOLD = 0.2; // Top 20% of the drop zone
  const AFTER_THRESHOLD = 0.8; // Bottom 20% of the drop zone

  let positionWithinDropZone: 'before' | 'inside' | 'after';

  if (clampedY < BEFORE_THRESHOLD) {
    positionWithinDropZone = 'before';
  } else if (clampedY > AFTER_THRESHOLD) {
    positionWithinDropZone = 'after';
  } else {
    positionWithinDropZone = 'inside';
  }

  return {
    positionWithinDropZone,
    relativePosition: clampedY,
  };
}
