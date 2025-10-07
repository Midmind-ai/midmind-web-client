/**
 * SSE Event types for chat streaming.
 * This is the contract between backend and frontend for SSE events.
 */

export interface SSEContentEvent {
  type: 'content';
  id: string;
  content: string;
}

export interface SSECompleteEvent {
  type: 'complete';
  id: string;
}

export interface SSEErrorEvent {
  type: 'error';
  id: string;
  content: string;
}

export interface SSETitleEvent {
  type: 'title';
  id: string;
  content: string;
}

export type SSEEvent = SSEContentEvent | SSECompleteEvent | SSEErrorEvent | SSETitleEvent;
