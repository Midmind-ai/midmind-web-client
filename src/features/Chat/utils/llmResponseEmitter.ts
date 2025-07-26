import EventEmitter from 'eventemitter3';

import type { SendMessageToChatResponse } from '@/shared/services/chats/types';

export const llmResponseEmitter = new EventEmitter();

export const emitResponseChunk = (chunk: SendMessageToChatResponse) => {
  llmResponseEmitter.emit('responseChunk', chunk);
};

export const subscribeToResponseChunk = (callback: (chunk: SendMessageToChatResponse) => void) => {
  llmResponseEmitter.on('responseChunk', callback);
};

export const unsubscribeFromResponseChunk = (
  callback: (chunk: SendMessageToChatResponse) => void
) => {
  llmResponseEmitter.off('responseChunk', callback);
};

export const clearAllResponseChunkListeners = () => {
  llmResponseEmitter.removeAllListeners('responseChunk');
};
