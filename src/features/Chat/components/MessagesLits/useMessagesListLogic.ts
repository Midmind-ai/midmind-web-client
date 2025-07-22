import { useParams } from 'react-router';

import { useGetChatDetails } from '@/features/Chat/hooks/useGetChatDetails';

export const useMessagesListLogic = () => {
  const { id } = useParams();
  const { chatDetails, isLoading } = useGetChatDetails(id || '');

  return { chatDetails, isLoading, id };
};
