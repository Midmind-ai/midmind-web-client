import useSWR from 'swr';

import { SWRCacheKeys } from '@/shared/constants/api';
import { ChatsService } from '@/shared/services/chats/chatsService';

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
