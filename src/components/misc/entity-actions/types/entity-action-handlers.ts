export type EntityActionHandlers = {
  onDelete?: () => void;
  onRename?: () => void;
  onOpenInNewTab?: () => void;
  onOpenInSidePanel?: () => void;
  onConvertToFolder?: () => void;
  onConvertToProject?: () => void;
};
