import EventEmitter from 'eventemitter3';

import type { components } from 'generated/api-types';

export type MessageReplyEvent = {
  replyTo: components['schemas']['ReplyToDto'];
  targetChatId?: string;
};

export const messageReplyEmitter = new EventEmitter();

export const emitMessageReply = (event: MessageReplyEvent) => {
  messageReplyEmitter.emit('messageReply', event);
};

export const subscribeToMessageReply = (callback: (event: MessageReplyEvent) => void) => {
  messageReplyEmitter.on('messageReply', callback);
};

export const unsubscribeFromMessageReply = (
  callback: (event: MessageReplyEvent) => void
) => {
  messageReplyEmitter.off('messageReply', callback);
};

export const clearAllMessageReplyListeners = () => {
  messageReplyEmitter.removeAllListeners('messageReply');
};
