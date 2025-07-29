import { useRef, type UIEvent, useEffect } from 'react';

import { useParams } from 'react-router';

import { useGetChatMessages } from '@/features/Chat/hooks/useGetChatMessages';

const LOAD_MORE_SCROLL_DISTANCE = 1000; // 1000px

export const useMessageListLogic = () => {
  const { id: chatId = '' } = useParams();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const previousScrollTopPositionRef = useRef(0);

  const {
    messages,
    isLoading: isMessagesLoading,
    hasMore,
    loadMore,
    isValidating,
  } = useGetChatMessages(chatId);

  const handleAutoScroll = (withAnimation = true) => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );

      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: withAnimation ? 'smooth' : 'auto',
        });
      }
    }
  };

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

  useEffect(() => {
    handleAutoScroll(false);
  }, [chatId, isMessagesLoading]);

  return {
    messages,
    isMessagesLoading,
    scrollAreaRef,
    handleScroll,
  };
};
