import { useEffect, useRef } from 'react';

import {
  subscribeToBranchCreated,
  unsubscribeFromBranchCreated,
} from '@features/chat/utils/branch-creation-emitter';
import type { BranchEvent } from '@features/chat/utils/branch-creation-emitter';

export const useBranchContext = (chatId: string) => {
  const branchContextRef = useRef<BranchEvent['branchContext'] | undefined>(undefined);

  const clearBranchContext = () => {
    branchContextRef.current = undefined;
  };

  useEffect(() => {
    const handleBranchCreated = (event: BranchEvent) => {
      branchContextRef.current = event.branchContext;
    };

    subscribeToBranchCreated(handleBranchCreated);

    return () => {
      unsubscribeFromBranchCreated(handleBranchCreated);
    };
  }, [chatId]);

  return {
    branchContext: branchContextRef.current,
    clearBranchContext,
  };
};
