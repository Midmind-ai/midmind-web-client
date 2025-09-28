import { useDroppable, useDndContext } from '@dnd-kit/core';
import React from 'react';
import DropPositionIndicator from './drop-position-indicator';
import type { DroppableData } from '@features/file-system/hooks/use-file-system.actions';
import type { PositionAwareCollisionData } from '@features/file-system/utils/position-aware-collision-detection';
import { cn } from '@utils/cn';

export type PositionIntent = 'before' | 'inside' | 'after';

type Props = {
  children: React.ReactNode;
  data: DroppableData;
  className?: string;
  enablePositionDetection?: boolean;
};

const DropZone = ({
  children,
  data,
  className,
  enablePositionDetection = false,
}: Props) => {
  const { setNodeRef, isOver, active } = useDroppable({
    id: data.id,
    data: data,
  });

  const { collisions } = useDndContext();

  // Determine if the current dragged item can be dropped here
  const canAcceptDrop = active?.data.current
    ? data.accepts.includes(active.data.current.type)
    : false;

  // Only show drop feedback if the item can actually be dropped
  const showDropFeedback = isOver && canAcceptDrop;
  const showInvalidFeedback = isOver && !canAcceptDrop;

  // Get the position intent from collision data
  const currentCollision = collisions?.find(collision => collision.id === data.id);
  const currentIntent =
    (currentCollision?.data as PositionAwareCollisionData)?.positionWithinDropZone ||
    'inside';

  // Show position indicator for all valid drops with position detection
  const showPositionIndicator = showDropFeedback && enablePositionDetection;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative rounded-sm',
        {
          // Invalid drop target
          'bg-red-300/20': showInvalidFeedback,
        },
        className
      )}
    >
      {children}
      {/* Position indicators */}
      {showPositionIndicator && (
        <DropPositionIndicator
          isVisible={true}
          position={currentIntent}
        />
      )}
    </div>
  );
};

export default DropZone;
