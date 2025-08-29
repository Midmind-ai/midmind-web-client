import FileViewModal, {
  type FileViewModalProps,
} from '@features/chat/components/file-view-modal/file-view-modal';

import type { BaseModalProps } from '@shared-types/modal';

export type ModalPropsMap = {
  FileViewModal: Omit<FileViewModalProps, keyof BaseModalProps>;
};

// modal name must be unique
export const Modals = {
  FileViewModal,
} as const;

export type ModalNames = keyof typeof Modals;
