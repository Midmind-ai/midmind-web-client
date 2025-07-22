import { useParams } from 'react-router';
import useSWR from 'swr';

import { ChatsService } from '@shared/services/chats/chatsService';

import { SWRCacheKeys } from '@/shared/constants/api';

export const useMessagesListLogic = () => {
  const { id } = useParams();

  const { data: chatDetails, isLoading: isChatDetailsLoading } = useSWR(
    SWRCacheKeys.GetChatDetails(id || ''),
    () => ChatsService.getChatDetails(id || ''),
    { revalidateOnFocus: false }
  );

  return { chatDetails, isChatDetailsLoading, id };
};
