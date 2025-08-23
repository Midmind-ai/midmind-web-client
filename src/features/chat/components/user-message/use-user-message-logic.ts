import { useEffect, useRef } from 'react';

import {
  subscribeToMessageSent,
  unsubscribeFromMessageSent,
} from '@features/chat/utils/message-send-emitter';
import { captureSelection } from '@features/chat/utils/text-selection';

type UseUserMessageLogicArgs = {
  onAutoScroll: VoidFunction;
};

export const useUserMessageLogic = ({ onAutoScroll }: UseUserMessageLogicArgs) => {
  const messageRef = useRef<HTMLDivElement>(null);

  const getCurrentSelectionContext = () => {
    if (messageRef.current) {
      return captureSelection(messageRef.current);
    }
  };

  useEffect(() => {
    const handleMessageSent = () => {
      onAutoScroll();
    };

    subscribeToMessageSent(handleMessageSent);

    return () => {
      unsubscribeFromMessageSent(handleMessageSent);
    };
  }, [onAutoScroll]);

  return {
    messageRef,
    getCurrentSelectionContext,
  };
};
