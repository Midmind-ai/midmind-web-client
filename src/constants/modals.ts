import FileViewModal, {
  type FileViewModalProps,
} from '@features/chat/components/file-view-modal/file-view-modal';

// Empty type for when no modals are registered

export type ModalPropsMap = {
  FileViewModal: Omit<FileViewModalProps, 'open' | 'onAnimationEnd'>;
};

// modal name must be unique
export const Modals = {
  FileViewModal,
} as const;

export type ModalNames = keyof typeof Modals;
