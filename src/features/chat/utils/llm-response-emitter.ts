import EventEmitter from 'eventemitter3';

import type { ConversationWithAIResponseDto } from '@/services/conversations/conversations-dtos';

export const llmResponseEmitter = new EventEmitter();

export const emitResponseChunk = (chunk: ConversationWithAIResponseDto) => {
  llmResponseEmitter.emit('responseChunk', chunk);
};

export const subscribeToResponseChunk = (
  callback: (chunk: ConversationWithAIResponseDto) => void
) => {
  llmResponseEmitter.on('responseChunk', callback);
};

export const unsubscribeFromResponseChunk = (
  callback: (chunk: ConversationWithAIResponseDto) => void
) => {
  llmResponseEmitter.off('responseChunk', callback);
};

export const clearAllResponseChunkListeners = () => {
  llmResponseEmitter.removeAllListeners('responseChunk');
};

export const clearResponseChunkListenersForChat = () => {
  llmResponseEmitter.removeAllListeners('responseChunk');
};
