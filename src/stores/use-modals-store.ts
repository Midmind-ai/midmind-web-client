import { create } from 'zustand';

import type { ModalNames, ModalPropsMap } from '@constants/modals';

type ModalData<T extends ModalNames = ModalNames> = {
  name: T;
  props?: ModalPropsMap[T];
};

type ModalsState = {
  modals: ModalData[];
  closingModals: Set<string>;
  openModal: <T extends ModalNames>(
    modalName: T,
    ...args: ModalPropsMap[T] extends null ? [] : [props: ModalPropsMap[T]]
  ) => void;
  closeModal: (modalName: ModalNames) => void;
  finishClosing: (modalName: ModalNames) => void;
  closeAllModals: () => void;
};

export const useModalsStore = create<ModalsState>(set => ({
  modals: [],
  closingModals: new Set(),
  openModal: (modalName, props?) => {
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
