import type { ConnectionType } from '@features/chat/types/chat-types';

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
