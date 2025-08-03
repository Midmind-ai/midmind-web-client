import { useEffect, useRef } from 'react';

import {
  subscribeToThreadCreated,
  unsubscribeFromThreadCreated,
} from '@/features/Chat/utils/threadEventEmitter';
import type { ThreadEvent } from '@/features/Chat/utils/threadEventEmitter';

export const useThreadContext = (chatId: string) => {
  const threadContextRef = useRef<ThreadEvent['threadContext'] | undefined>(undefined);

  const clearThreadContext = () => {
    threadContextRef.current = undefined;
  };

  useEffect(() => {
    const handleThreadCreated = (event: ThreadEvent) => {
      threadContextRef.current = event.threadContext;
    };

    subscribeToThreadCreated(handleThreadCreated);

    return () => {
      unsubscribeFromThreadCreated(handleThreadCreated);
    };
  }, [chatId]);

  return {
    threadContext: threadContextRef.current,
    clearThreadContext,
  };
};
