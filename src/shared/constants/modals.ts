// modal name must be unique
export const Modals = {
  TestModal: () => null,
} as const;

export type ModalNames = keyof typeof Modals;
