import EventEmitter from 'eventemitter3';

import type { BranchContext } from '@/types/entities';

export type BranchEvent = {
  branchContext: BranchContext;
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
