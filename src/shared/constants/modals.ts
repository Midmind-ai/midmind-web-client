// modal name must be unique
export const Modals = {} as const;

export type ModalNames = keyof typeof Modals;
