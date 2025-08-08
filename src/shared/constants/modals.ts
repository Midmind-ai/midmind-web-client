import NestedModal from '@/app/nested-modal';
import TestModal, { type TestModalProps } from '@/app/test-modal';

// base type for all modal props
export type BaseModalProps = {
  open: boolean;
  onAnimationEnd: () => void;
};

export type ModalPropsMap = {
  TestModal: Omit<TestModalProps, keyof BaseModalProps>;
  NestedModal: null;
};

// modal name must be unique
export const Modals = {
  TestModal,
  NestedModal,
} as const;

export type ModalNames = keyof typeof Modals;
