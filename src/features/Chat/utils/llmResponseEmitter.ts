import EventEmitter from 'eventemitter3';

import type { ConversationWithAIResponse } from '@/shared/services/chats/types';

export const llmResponseEmitter = new EventEmitter();

export const emitResponseChunk = (chunk: ConversationWithAIResponse) => {
  llmResponseEmitter.emit('responseChunk', chunk);
};

export const subscribeToResponseChunk = (callback: (chunk: ConversationWithAIResponse) => void) => {
  llmResponseEmitter.on('responseChunk', callback);
};

export const unsubscribeFromResponseChunk = (
  callback: (chunk: ConversationWithAIResponse) => void
) => {
  llmResponseEmitter.off('responseChunk', callback);
};

export const clearAllResponseChunkListeners = () => {
  llmResponseEmitter.removeAllListeners('responseChunk');
};

export const clearResponseChunkListenersForChat = () => {
  llmResponseEmitter.removeAllListeners('responseChunk');
};
