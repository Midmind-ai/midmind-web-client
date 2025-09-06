import EventEmitter from 'eventemitter3';

import type { ConversationBranchContext } from '@shared-types/entities';

export type BranchEvent = {
  branchContext: ConversationBranchContext;
};

export const branchEventEmitter = new EventEmitter();

export const emitBranchCreated = (event: BranchEvent) => {
  branchEventEmitter.emit('branchCreated', event);
};

export const subscribeToBranchCreated = (callback: (event: BranchEvent) => void) => {
  branchEventEmitter.on('branchCreated', callback);
};

export const unsubscribeFromBranchCreated = (callback: (event: BranchEvent) => void) => {
  branchEventEmitter.off('branchCreated', callback);
};

export const clearAllBranchCreatedListeners = () => {
  branchEventEmitter.removeAllListeners('branchCreated');
};
