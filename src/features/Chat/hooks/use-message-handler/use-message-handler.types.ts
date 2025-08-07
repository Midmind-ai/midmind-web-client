import type { ConnectionType } from '../../types/chatTypes';

export type UseMessageSelectionContextT = {
  endPosition: number;
  selectedText: string;
  startPosition: number;
};

export type CreateBranchArgs = {
  content: string;
  messageId: string;
  connectionType: ConnectionType;
  selectionContext?: UseMessageSelectionContextT;
};
