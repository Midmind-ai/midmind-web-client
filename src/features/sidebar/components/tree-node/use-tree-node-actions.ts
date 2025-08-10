import { useCallback } from 'react';

type Props = {
  nodeId: string;
  onDelete: VoidFunction;
  onOpenInSidePanel: (id: string) => void;
  onOpenInNewTab: (id: string) => void;
};

export const useTreeNodeActions = ({
  nodeId,
  onDelete,
  onOpenInSidePanel,
  onOpenInNewTab,
}: Props) => {
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete();
    },
    [onDelete]
  );

  const handleOpenInSidePanel = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpenInSidePanel(nodeId);
    },
    [nodeId, onOpenInSidePanel]
  );

  const handleOpenInNewTab = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpenInNewTab(nodeId);
    },
    [nodeId, onOpenInNewTab]
  );

  return {
    handleDelete,
    handleOpenInSidePanel,
    handleOpenInNewTab,
  };
};
