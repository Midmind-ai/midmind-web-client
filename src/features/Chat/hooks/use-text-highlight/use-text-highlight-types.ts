import type { ConnectionType } from '@/features/chat/types/chat-types';

export type ThreadContext = {
  color: string;
  threadId: string;
  endPosition: number;
  startPosition: number;
  connectionType: ConnectionType;
};

export type HighlightTextNodeArgs = {
  textNode: Text;
  threadContext: ThreadContext;
  onSelectionClick: (threadId: string) => void;
};
