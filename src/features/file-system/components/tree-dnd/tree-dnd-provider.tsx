import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
  type DragOverEvent,
  type DragStartEvent,
  type DragEndEvent,
  MouseSensor,
  DragOverlay,
} from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import { SidebarMenu } from '../../../../components/ui/sidebar';
import DragOverlayNode from './drag-overlay-node';
import { useFileSystemActions } from '@features/file-system/hooks/use-file-system.actions';
import { useDragStateStore } from '@features/file-system/stores/drag-state.store';
import { positionAwareCollisionDetection } from '@features/file-system/utils/position-aware-collision-detection';

type Props = {
  children: React.ReactNode;
};

const TreeDndProvider = ({ children }: Props) => {
  const controller = useFileSystemActions();
  const { handleDragStart, handleDragEnd, handleDragCancel } = controller.actions;
  const { draggedNode } = controller.ui;
  const setDragging = useDragStateStore(state => state.setDragging);

  // Configure sensors for different input methods
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // Require 8px movement before drag starts
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 1, // Require 8px movement before drag starts
      },
    })
  );

  const handleDragOver = (_event: DragOverEvent) => {
    // Optional: Add visual feedback during drag over
    // This could be used to show/hide drop indicators
  };

  // Wrap drag handlers to update global state
  const onDragStart = (event: DragStartEvent) => {
    const itemId = event.active.id as string;
    setDragging(itemId);
    handleDragStart(event);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setDragging(null);
    await handleDragEnd(event);
  };

  const onDragCancel = () => {
    setDragging(null);
    handleDragCancel();
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
      onDragStart={onDragStart}
      onDragOver={handleDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {children}

      {createPortal(
        <DragOverlay style={{ pointerEvents: 'none' }}>
          {draggedNode ? (
            <div
              className="pointer-events-none transform-gpu overflow-hidden rounded-md
                border-1 opacity-55 transition-transform duration-100 ease-out"
              style={{
                transform: 'rotate(0.5deg) scale(0.7)',
                boxShadow:
                  '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <SidebarMenu
                className="bg-card border-border/50 gap-[2px] rounded-md border"
              >
                <DragOverlayNode node={draggedNode.node} />
              </SidebarMenu>
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default TreeDndProvider;
