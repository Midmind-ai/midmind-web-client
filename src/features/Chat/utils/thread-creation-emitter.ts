import EventEmitter from 'eventemitter3';

import type { components } from '@/shared/services/types/generated';

export type ThreadEvent = {
  threadContext: components['schemas']['ConversationThreadContextDto'];
};

export const threadEventEmitter = new EventEmitter();

export const emitThreadCreated = (event: ThreadEvent) => {
  threadEventEmitter.emit('threadCreated', event);
};

export const subscribeToThreadCreated = (callback: (event: ThreadEvent) => void) => {
  threadEventEmitter.on('threadCreated', callback);
};

export const unsubscribeFromThreadCreated = (callback: (event: ThreadEvent) => void) => {
  threadEventEmitter.off('threadCreated', callback);
};

export const clearAllThreadCreatedListeners = () => {
  threadEventEmitter.removeAllListeners('threadCreated');
};
