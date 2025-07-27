import { useRef } from 'react';

import { useParams } from 'react-router';

import { useGetChatDetails } from '@/features/Chat/hooks/useGetChatDetails';
import { useGetChatMessages } from '@/features/Chat/hooks/useGetChatMessages';
import { useUpdateChatDetails } from '@/features/Chat/hooks/useUpdateChatDetails';

export const useMessageListLogic = () => {
  const { id: chatId } = useParams();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { chatDetails, isLoading: isChatDetailsLoading } = useGetChatDetails(chatId || '');
  const { messages, isLoading: isMessagesLoading } = useGetChatMessages(chatId || '', {
    skip: 0,
    take: 20,
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
  };
};
