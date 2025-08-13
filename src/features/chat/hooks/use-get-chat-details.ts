import useSWR from 'swr';

import { SWRCacheKeys } from '@/constants/api';
import { ChatsService } from '@/services/chats/chats-service';

export const useGetChatDetails = (id: string) => {
  const {
    data: chatDetails,
    isLoading: isLoading,
    error,
  } = useSWR(SWRCacheKeys.GetChatDetails(id), () => ChatsService.getChatDetails(id));

  return {
    chatDetails,
    isLoading,
    error,
  };
};
