import { useEffect, useRef } from 'react';

import {
  subscribeToMessageSent,
  unsubscribeFromMessageSent,
} from '@features/chat-old/utils/message-send-emitter';
import { captureSelection } from '@features/chat-old/utils/text-selection';

type UseUserMessageLogicArgs = {
  chatId: string;
  onAutoScroll: VoidFunction;
};

export const useUserMessageLogic = ({
  chatId,
  onAutoScroll,
}: UseUserMessageLogicArgs) => {
  const messageRef = useRef<HTMLDivElement>(null);

  const getCurrentSelectionContext = () => {
    if (messageRef.current) {
      return captureSelection(messageRef.current);
    }
  };

  useEffect(() => {
    const handleMessageSent = (messageChatId: string) => {
      if (messageChatId === chatId) {
        onAutoScroll();
      }
    };

    subscribeToMessageSent(handleMessageSent);

    return () => {
      unsubscribeFromMessageSent(handleMessageSent);
    };
  }, [chatId, onAutoScroll]);

  return {
    messageRef,
    getCurrentSelectionContext,
  };
};
