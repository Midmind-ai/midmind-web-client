import { useParams } from 'react-router';

import { useGetChatDetails } from '@/features/Chat/hooks/useGetChatDetails';
import { useGetChatMessages } from '@/features/Chat/hooks/useGetChatMessages';
import { useUpdateChatDetails } from '@/features/Chat/hooks/useUpdateChatDetails';

export const useMessagesListLogic = () => {
  const { id: chatId } = useParams();
  const { chatDetails, isLoading: isChatDetailsLoading } = useGetChatDetails(chatId || '');
  const { messages, isLoading: isMessagesLoading } = useGetChatMessages(chatId || '');
  const { updateChatDetails, isLoading: isUpdating } = useUpdateChatDetails();

  return {
    chatDetails,
    isChatDetailsLoading,
    chatId,
    messages,
    isMessagesLoading,
    isUpdating,
    updateChatDetails,
  };
};
