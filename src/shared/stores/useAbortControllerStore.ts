import { create } from 'zustand';

type AbortControllerState = {
  abortControllers: Map<string, AbortController>;
  createAbortController: (chatId: string) => AbortController;
  abortCurrentRequest: (chatId: string) => void;
  clearAbortController: (chatId: string) => void;
  getAbortController: (chatId: string) => AbortController | null;
};

export const useAbortControllerStore = create<AbortControllerState>((set, get) => ({
  abortControllers: new Map(),
  createAbortController: (chatId: string) => {
    const { abortControllers } = get();

    const existingController = abortControllers.get(chatId);

    if (existingController) {
      existingController.abort();
    }

    const newAbortController = new AbortController();

    const newControllers = new Map(abortControllers);

    newControllers.set(chatId, newAbortController);

    set({ abortControllers: newControllers });

    return newAbortController;
  },
  abortCurrentRequest: (chatId: string) => {
    const { abortControllers } = get();

    const controller = abortControllers.get(chatId);

    if (controller) {
      controller.abort();

      const newControllers = new Map(abortControllers);

      newControllers.delete(chatId);

      set({ abortControllers: newControllers });
    }
  },
  clearAbortController: (chatId: string) => {
    const { abortControllers } = get();

    const newControllers = new Map(abortControllers);

    newControllers.delete(chatId);

    set({ abortControllers: newControllers });
  },
  getAbortController: (chatId: string) => {
    const { abortControllers } = get();

    return abortControllers.get(chatId) || null;
  },
}));
