import type { ConnectionType, ContextType } from '../../types/chatTypes';

export type ChatThreadContext = {
  endPosition: number;
  selectedText: string;
  startPosition: number;
};

export type DefiniteThreads = {
  connection_color: string;
  end_position: number;
  id: string;
  start_position: number;
  child_chat_id: string;
  connection_type: ConnectionType;
  context_type: ContextType;
};
