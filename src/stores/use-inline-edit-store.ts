import { create } from 'zustand';

interface InlineEditState {
  editingEntityId: string | null;
  startEditing: (entityId: string) => void;
  stopEditing: () => void;
  isEditing: (entityId: string) => boolean;
}

export const useInlineEditStore = create<InlineEditState>((set, get) => ({
  editingEntityId: null,
  // TODO add entity type to render proper icon type

  startEditing: (entityId: string) => {
    set({ editingEntityId: entityId });
  },

  stopEditing: () => {
    set({ editingEntityId: null });
  },

  isEditing: (entityId: string) => {
    const state = get();

    return state.editingEntityId === entityId;
  },
}));
