import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
  type DragOverEvent,
} from '@dnd-kit/core';
import { useFileSystemActions } from '@features/file-system/hooks/use-file-system.actions';
import { positionAwareCollisionDetection } from '@features/file-system/utils/position-aware-collision-detection';

type Props = {
  children: React.ReactNode;
};

const TreeDndProvider = ({ children }: Props) => {
  const controller = useFileSystemActions();
  const { handleDragStart, handleDragEnd, handleDragCancel } = controller.actions;

  // Configure sensors for different input methods
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      // TODO: Add keyboard navigation support
    })
  );

  const handleDragOver = (_event: DragOverEvent) => {
    // Optional: Add visual feedback during drag over
    // This could be used to show/hide drop indicators
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={positionAwareCollisionDetection}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
    </DndContext>
  );
};

export default TreeDndProvider;
