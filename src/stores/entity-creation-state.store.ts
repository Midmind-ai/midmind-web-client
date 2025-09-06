import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type EntityCreationStore = {
  creatingEntityIds: Set<string>;
  startCreating: (entityId: string) => void;
  finishCreating: (entityId: string) => void;
  isCreating: (entityId: string) => boolean;
  getAllCreating: () => Set<string>;
};

export const useEntityCreationStateStore = create<EntityCreationStore>()(
  devtools(
    (set, get) => ({
      creatingEntityIds: new Set<string>(),

      startCreating: (entityId: string) => {
        set(state => ({
          ...state,
          creatingEntityIds: new Set(state.creatingEntityIds).add(entityId),
        }));
      },

      finishCreating: (entityId: string) => {
        set(state => {
          const newSet = new Set(state.creatingEntityIds);
          newSet.delete(entityId);

          return {
            ...state,
            creatingEntityIds: newSet,
          };
        });
      },

      isCreating: (entityId: string) => {
        const state = get();

        return state.creatingEntityIds.has(entityId);
      },

      getAllCreating: () => {
        const state = get();

        return state.creatingEntityIds;
      },
    }),
    { name: 'entity-creation-store' }
  )
);
