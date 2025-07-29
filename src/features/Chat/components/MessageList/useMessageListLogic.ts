import { useRef, type UIEvent, useEffect } from 'react';

import { useParams } from 'react-router';

// import { useGetChatDetails } from '@/features/Chat/hooks/useGetChatDetails';
import { useGetChatMessages } from '@/features/Chat/hooks/useGetChatMessages';
// import { useUpdateChatDetails } from '@/features/Chat/hooks/useUpdateChatDetails';

const LOAD_MORE_SCROLL_DISTANCE = 1000;

export const useMessageListLogic = () => {
  const { id: chatId = '' } = useParams();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // const { chatDetails, isLoading: isChatDetailsLoading } = useGetChatDetails(chatId); // not used yet
  const {
    messages,
    isLoading: isMessagesLoading,
    hasMore,
    loadMore,
    // refresh,
    isValidating,
  } = useGetChatMessages(chatId);
  // const { updateChatDetails, isLoading: isUpdating } = useUpdateChatDetails(); // not used yet

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

    if (scrollTop < LOAD_MORE_SCROLL_DISTANCE && hasMore && !isValidating && !isMessagesLoading) {
      loadMore();
    }
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
