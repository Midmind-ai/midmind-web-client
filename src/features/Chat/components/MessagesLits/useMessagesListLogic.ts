import { useParams } from 'react-router';

import { useGetChatDetails } from '@/features/Chat/hooks/useGetChatDetails';

export const useMessagesListLogic = () => {
  const { id: chatId } = useParams();
  const { chatDetails, isLoading } = useGetChatDetails(chatId || '');

  return { chatDetails, isLoading, chatId };
};
