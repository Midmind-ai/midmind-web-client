import NestedModal from '@app/nested-modal';
import TestModal, { type TestModalProps } from '@app/test-modal';

import CreateDirectoryModal, {
  type CreateDirectoryModalProps,
} from '@features/sidebar/components/create-directory-modal/create-directory-modal';

// base type for all modal props
export type BaseModalProps = {
  open: boolean;
  onAnimationEnd: () => void;
};

export type ModalPropsMap = {
  TestModal: Omit<TestModalProps, keyof BaseModalProps>;
  NestedModal: null;
  CreateDirectoryModal: Omit<CreateDirectoryModalProps, keyof BaseModalProps>;
};

// modal name must be unique
export const Modals = {
  TestModal,
  NestedModal,
  CreateDirectoryModal,
} as const;

export type ModalNames = keyof typeof Modals;
