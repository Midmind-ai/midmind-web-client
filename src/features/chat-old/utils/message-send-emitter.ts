import EventEmitter from 'eventemitter3';

export const messageSendEventEmitter = new EventEmitter();

export const emitMessageSent = (chatId: string) => {
  messageSendEventEmitter.emit('messageSent', chatId);
};

export const subscribeToMessageSent = (callback: (chatId: string) => void) => {
  messageSendEventEmitter.on('messageSent', callback);
};

export const unsubscribeFromMessageSent = (callback: (chatId: string) => void) => {
  messageSendEventEmitter.off('messageSent', callback);
};

export const clearAllMessageSentListeners = () => {
  messageSendEventEmitter.removeAllListeners('messageSent');
};
