import { create } from 'zustand';

import type { ModalNames } from '@/shared/constants/modals';

type ModalData = {
  name: ModalNames;
  props: Record<string, unknown>;
};

type ModalsState = {
  modals: ModalData[];
  closingModals: Set<string>;
  openModal: (modalName: ModalNames, props?: Record<string, unknown>) => void;
  closeModal: (modalName: ModalNames) => void;
  closeAllModals: () => void;
  finishClosing: (modalName: ModalNames) => void;
};

export const useModalsStore = create<ModalsState>(set => ({
  modals: [],
  closingModals: new Set(),
  openModal: (modalName: ModalNames, props = {}) => {
    set(state => ({
      modals: [...state.modals, { name: modalName, props }],
    }));
  },
  closeModal: (modalName: ModalNames) => {
    set(state => ({
      closingModals: new Set([...state.closingModals, modalName]),
    }));
  },
  finishClosing: (modalName: ModalNames) => {
    set(state => {
      const newModals = state.modals.filter(modal => modal.name !== modalName);
      const newClosingModals = new Set(state.closingModals);
      newClosingModals.delete(modalName);

      return {
        modals: newModals,
        closingModals: newClosingModals,
      };
    });
  },
  closeAllModals: () => {
    set(state => {
      const allModalNames = state.modals.map(modal => modal.name);

      return {
        closingModals: new Set([...state.closingModals, ...allModalNames]),
      };
    });
  },
}));

export const useModalActions = () => {
  const openModal = useModalsStore(state => state.openModal);
  const closeModal = useModalsStore(state => state.closeModal);
  const closeAllModals = useModalsStore(state => state.closeAllModals);

  return {
    openModal,
    closeModal,
    closeAllModals,
  };
};
