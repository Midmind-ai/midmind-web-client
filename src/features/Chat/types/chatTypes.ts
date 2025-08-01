export type ConnectionType = 'attached' | 'detached' | 'temporary';

export type ContextType = 'full_message' | 'text_selection';

export type LLModel =
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-lite'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro';
