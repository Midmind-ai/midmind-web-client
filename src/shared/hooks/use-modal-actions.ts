import { useModalsStore } from '@shared/stores/use-modals-store';

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
