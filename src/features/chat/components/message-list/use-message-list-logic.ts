import { useRef, type UIEvent, useEffect, useCallback } from 'react';

import { useChatActions } from '@features/chat/hooks/use-chat-actions';
import { useGetChatMessages } from '@features/chat/hooks/use-get-chat-messages';
import { useMessageActions } from '@features/chat/hooks/use-message-actions';

const LOAD_MORE_SCROLL_DISTANCE = 1000; // 1000px

export const useMessageListLogic = (chatId: string) => {
  const {
    messages,
    isLoading: isMessagesLoading,
    hasMore,
    loadMore,
    isValidating,
  } = useGetChatMessages(chatId);

  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const previousScrollTopPositionRef = useRef(0);

  const chatActions = useChatActions(chatId);
  const messageActions = useMessageActions(chatId);

  const scrollToTarget = useCallback((withAnimation = false) => {
    if (!scrollTargetRef.current) {
      return;
    }

    scrollTargetRef.current.scrollIntoView({
      behavior: withAnimation ? 'smooth' : 'auto',
      block: 'start',
    });
  }, []);

  const scrollToBottom = useCallback((withAnimation = false) => {
    if (!scrollAreaRef.current) {
      return;
    }

    const scrollElement = scrollAreaRef.current.querySelector(
      '[data-radix-scroll-area-viewport]'
    );

    if (scrollElement) {
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: withAnimation ? 'smooth' : 'auto',
      });
    }
  }, []);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    const scrollTop = target.scrollTop;

    const isScrollingUp = scrollTop < previousScrollTopPositionRef.current;

    if (
      isScrollingUp &&
      scrollTop < LOAD_MORE_SCROLL_DISTANCE &&
      hasMore &&
      !isValidating &&
      !isMessagesLoading
    ) {
      loadMore();
    }

    previousScrollTopPositionRef.current = scrollTop;
  };

  const handleAutoScroll = useCallback(() => {
    scrollToTarget(true);
  }, [scrollToTarget]);

  useEffect(() => {
    scrollToTarget();
  }, [chatId, isMessagesLoading, scrollToTarget]);

  return {
    messages,
    chatActions,
    scrollAreaRef,
    messageActions,
    scrollTargetRef,
    isMessagesLoading,
    handleScroll,
    scrollToBottom,
    handleAutoScroll,
  };
};
