import { create } from 'zustand';

interface DragStateStore {
  isDraggingAny: boolean;
  draggedItemId: string | null;
  setDragging: (itemId: string | null) => void;
}

export const useDragStateStore = create<DragStateStore>(set => ({
  isDraggingAny: false,
  draggedItemId: null,

  setDragging: (itemId: string | null) => {
    const isDragging = !!itemId;

    // Apply global cursor class to body
    if (isDragging) {
      document.body.classList.add('dragging-cursor');
    } else {
      document.body.classList.remove('dragging-cursor');
    }

    set({
      isDraggingAny: isDragging,
      draggedItemId: itemId,
    });
  },
}));
