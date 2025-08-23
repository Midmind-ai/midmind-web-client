import EventEmitter from 'eventemitter3';

export const messageSendEventEmitter = new EventEmitter();

export const emitMessageSent = () => {
  messageSendEventEmitter.emit('messageSent');
};

export const subscribeToMessageSent = (callback: () => void) => {
  messageSendEventEmitter.on('messageSent', callback);
};

export const unsubscribeFromMessageSent = (callback: () => void) => {
  messageSendEventEmitter.off('messageSent', callback);
};

export const clearAllMessageSentListeners = () => {
  messageSendEventEmitter.removeAllListeners('messageSent');
};
