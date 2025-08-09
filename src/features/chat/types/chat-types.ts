import { AI_MODELS } from '@features/chat/constants/ai-models';

export type ConnectionType = 'attached' | 'detached' | 'temporary';

export type ContextType = 'full_message' | 'text_selection';

export type LLModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

export type ChatMessageFormData = {
  content: string;
};

export type OnSubmitArgs = {
  content: string;
  model: LLModel;
};

export type BranchContext = {
  color: string;
  branchId: string;
  endPosition: number;
  startPosition: number;
  connectionType: ConnectionType;
};

export type HighlightTextNodeArgs = {
  textNode: Text;
  branchContext: BranchContext;
  onSelectionClick: (branchId: string) => void;
};

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

export type ChatBranchContext = {
  endPosition: number;
  selectedText: string;
  startPosition: number;
};

export type DefiniteBranches = {
  connection_color: string;
  end_position: number;
  id: string;
  start_position: number;
  child_chat_id: string;
  connection_type: ConnectionType;
  context_type: ContextType;
};
