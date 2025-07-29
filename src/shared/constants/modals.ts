import { NestedModal } from '@/app/NestedModal';
import { TestModal } from '@/app/TestModal';

// modal name must be unique
export const Modals = {
  TestModal,
  NestedModal,
} as const;

export type ModalNames = keyof typeof Modals;
