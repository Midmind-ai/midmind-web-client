import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_AI_MODEL } from '../constants/ai-models';
import { LocalStorageKeys } from '../constants/local-storage';
import type { AIModel } from '../types/entities';

type AiModelState = {
  currentModel: AIModel;
  setCurrentModel: (model: AIModel) => void;
};

export const useAiModelStore = create<AiModelState>()(
  persist(
    set => ({
      currentModel: DEFAULT_AI_MODEL as AIModel,
      setCurrentModel: (model: AIModel) => set({ currentModel: model }),
    }),
    {
      name: LocalStorageKeys.AiModel,
      partialize: state => ({ currentModel: state.currentModel }),
    }
  )
);
