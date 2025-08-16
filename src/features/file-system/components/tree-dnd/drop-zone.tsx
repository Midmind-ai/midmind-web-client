import { useDroppable } from '@dnd-kit/core';

import type { DroppableData } from '@features/file-system/hooks/use-tree-dnd-logic';

import { cn } from '@utils/cn';

type Props = {
  children: React.ReactNode;
  data: DroppableData;
  className?: string;
};

const DropZone = ({ children, data, className }: Props) => {
  const { setNodeRef, isOver, active } = useDroppable({
    id: data.id,
    data,
  });

  // Determine if the current dragged item can be dropped here
  const canAcceptDrop = active?.data.current
    ? data.accepts.includes(active.data.current.type as 'chat' | 'directory')
    : false;

  // Only show drop feedback if the item can actually be dropped
  const showDropFeedback = isOver && canAcceptDrop;
  const showInvalidFeedback = isOver && !canAcceptDrop;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-sm transition-all duration-150',
        {
          // Valid drop target - more prominent highlighting
          'bg-blue-500/20 ring-2 ring-blue-500/50': showDropFeedback,
          // Invalid drop target
          'bg-red-500/10 ring-1 ring-red-500/30': showInvalidFeedback,
        },
        className
      )}
    >
      {children}
    </div>
  );
};

export default DropZone;
