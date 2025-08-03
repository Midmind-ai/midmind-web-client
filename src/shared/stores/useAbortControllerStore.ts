import { create } from 'zustand';

interface AbortControllerStore {
  abortController: AbortController | null;
  createAbortController: () => AbortController;
  abortCurrentRequest: VoidFunction;
  clearAbortController: VoidFunction;
}

export const useAbortControllerStore = create<AbortControllerStore>((set, get) => ({
  abortController: null,
  createAbortController: () => {
    const { abortController } = get();

    if (abortController) {
      abortController.abort();
    }

    const newAbortController = new AbortController();

    set({ abortController: newAbortController });

    return newAbortController;
  },
  abortCurrentRequest: () => {
    const { abortController } = get();

    if (abortController) {
      abortController.abort();

      set({ abortController: null });
    }
  },
  clearAbortController: () => {
    set({ abortController: null });
  },
}));
