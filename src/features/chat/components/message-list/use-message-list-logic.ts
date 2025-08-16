import { useRef, type UIEvent, useEffect } from 'react';

import { useChatActions } from '@features/chat/hooks/use-chat-actions';
import { useGetChatMessages } from '@features/chat/hooks/use-get-chat-messages';
import { useMessageActions } from '@features/chat/hooks/use-message-actions';

const LOAD_MORE_SCROLL_DISTANCE = 1000; // 1000px
const NEAR_BOTTOM_THRESHOLD = 200; // 200px

export const useMessageListLogic = (chatId: string) => {
  const {
    messages,
    isLoading: isMessagesLoading,
    hasMore,
    loadMore,
    isValidating,
  } = useGetChatMessages(chatId);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const previousScrollTopPositionRef = useRef(0);
  const autoScrollEnabledRef = useRef(false);

  const chatActions = useChatActions(chatId);
  const messageActions = useMessageActions(chatId);

  const resetAutoScroll = () => {
    autoScrollEnabledRef.current = false;
  };

  const isNearBottom = () => {
    if (!scrollAreaRef.current) {
      return false;
    }

    const scrollElement = scrollAreaRef.current.querySelector(
      '[data-radix-scroll-area-viewport]'
    );

    if (!scrollElement) {
      return false;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    return distanceFromBottom < NEAR_BOTTOM_THRESHOLD;
  };

  const scrollToBottom = (withAnimation = false) => {
    if (!scrollAreaRef.current) {
      return;
    }

    if (autoScrollEnabledRef.current) {
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
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!isNearBottom()) {
      autoScrollEnabledRef.current = true;
    } else {
      resetAutoScroll();
    }

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

  const handleAutoScroll = () => {
    resetAutoScroll();
    scrollToBottom(true);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatId, isMessagesLoading]);

  return {
    messages,
    chatActions,
    scrollAreaRef,
    isMessagesLoading,
    messageActions,
    handleScroll,
    scrollToBottom,
    handleAutoScroll,
  };
};
