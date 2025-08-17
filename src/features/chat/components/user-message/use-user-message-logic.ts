import { useEffect, useRef } from 'react';

import { captureSelection } from '@features/chat/utils/text-selection';

type UseUserMessageLogicArgs = {
  isLastMessage: boolean;
  onAutoScroll: VoidFunction;
};

export const useUserMessageLogic = ({
  isLastMessage,
  onAutoScroll,
}: UseUserMessageLogicArgs) => {
  const messageRef = useRef<HTMLDivElement>(null);

  const getCurrentSelectionContext = () => {
    if (messageRef.current) {
      return captureSelection(messageRef.current);
    }
  };

  useEffect(() => {
    if (isLastMessage) {
      onAutoScroll();
    }
  }, [onAutoScroll, isLastMessage]);

  return {
    messageRef,
    getCurrentSelectionContext,
  };
};
