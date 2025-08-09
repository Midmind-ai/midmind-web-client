import { useLocation, useNavigate } from 'react-router';

import { AppRoutes, SearchParams } from '@shared/constants/router';

import { useUrlParams } from '@shared/hooks/use-url-params';

import { useDeleteChat } from '@features/chat/hooks/use-delete-chat';
import { useGetChats } from '@features/chat/hooks/use-get-chats';

import { useChatActions } from '@/features/chat/hooks/use-chat-actions';

export const useFolderListLogic = () => {
  const { chats, isLoading } = useGetChats();
  const navigate = useNavigate();
  const location = useLocation();
  const { deleteChat, isLoading: isDeleting } = useDeleteChat();
  const { openChatInSidePanel, openChatInNewTab } = useChatActions();
  const { value: splitChatId, removeValue } = useUrlParams(SearchParams.Split);

  const handleDelete = async (chatId: string) => {
    await deleteChat(chatId);

    if (splitChatId === chatId) {
      removeValue();
    }

    const currentChatId = location.pathname.split('/').pop();
    const updatedChats = (chats || []).filter(c => c.id !== chatId);

    if (currentChatId === chatId) {
      if (updatedChats.length > 0) {
        const currentSearch = location.search;
        navigate(
          `${AppRoutes.Chat(updatedChats[updatedChats.length - 1].id)}${currentSearch}`
        );
      } else {
        navigate(AppRoutes.Home);
      }
    }
  };

  return {
    chats,
    isLoading,
    isDeleting,
    handleDelete,
    openChatInSidePanel,
    openChatInNewTab,
  };
};
