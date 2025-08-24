import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  MeasuringStrategy,
  type DragOverEvent,
} from '@dnd-kit/core';

import { SidebarMenu } from '@components/ui/sidebar';

import DragOverlayNode from '@features/file-system/components/tree-dnd/drag-overlay-node';
import { useFileSystemActions } from '@features/file-system/use-file-system.actions';

type Props = {
  children: React.ReactNode;
};

const TreeDndProvider = ({ children }: Props) => {
  const controller = useFileSystemActions();
  const { handleDragStart, handleDragEnd, handleDragCancel } = controller.actions;
  const { draggedNode } = controller.ui;

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
      collisionDetection={closestCenter}
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
      <DragOverlay
        adjustScale={false}
        style={{
          transformOrigin: '0 0',
        }}
      >
        {draggedNode ? (
          <div
            className="scale-90 transform-gpu cursor-grabbing transition-transform
              duration-200 ease-out"
            style={{
              transform: 'rotate(2deg)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <SidebarMenu
              className="bg-sidebar border-border/50 gap-[2px] rounded-md border"
            >
              <DragOverlayNode node={draggedNode.node} />
            </SidebarMenu>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TreeDndProvider;
