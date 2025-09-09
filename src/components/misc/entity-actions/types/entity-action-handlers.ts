export type EntityActionHandlers = {
  onDelete: () => void;
  onRename?: () => void;
  onOpenInNewTab?: () => void;
  onOpenInSidePanel?: () => void;
};
