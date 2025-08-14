// base type for all modal props
export type BaseModalProps = {
  open: boolean;
  onAnimationEnd: () => void;
};

// Empty type for when no modals are registered
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ModalPropsMap = {};

// modal name must be unique
export const Modals = {} as const;

export type ModalNames = keyof typeof Modals;
