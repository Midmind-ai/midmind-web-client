import { useRef, useCallback, useState, useEffect, type UIEvent } from 'react';

import { useParams } from 'react-router';

import { useGetChatDetails } from '@/features/Chat/hooks/useGetChatDetails';
import { useGetChatMessages } from '@/features/Chat/hooks/useGetChatMessages';
import { useUpdateChatDetails } from '@/features/Chat/hooks/useUpdateChatDetails';

const TAKE = 20;

export const useMessageListLogic = () => {
  const { id: chatId } = useParams();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(TAKE);

  const { chatDetails, isLoading: isChatDetailsLoading } = useGetChatDetails(chatId || '');
  const { messages, isLoading: isMessagesLoading } = useGetChatMessages(chatId || '', {
    skip,
    take,
  });
  const { updateChatDetails, isLoading: isUpdating } = useUpdateChatDetails();

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

  const handleLoadMoreMessages = useCallback(() => {
    setSkip(prevSkip => prevSkip + take);
    setTake(TAKE);
  }, [take]);

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const target = event.target as HTMLDivElement;
      const scrollTop = target.scrollTop;

      if (scrollTop <= 5) {
        handleLoadMoreMessages();
      }
    },
    [handleLoadMoreMessages]
  );

  const resetPagination = useCallback(() => {
    setSkip(0);
    setTake(TAKE);
  }, []);

  useEffect(() => {
    resetPagination();
  }, [chatId, resetPagination]);

  return {
    chatDetails,
    isChatDetailsLoading,
    chatId,
    messages,
    isMessagesLoading,
    isUpdating,
    scrollAreaRef,
    updateChatDetails,
    handleAutoScroll,
    handleScroll,
    handleLoadMoreMessages,
  };
};
