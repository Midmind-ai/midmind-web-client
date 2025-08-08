import { useLocation, useNavigate } from 'react-router';

import { useDeleteChat } from '@/features/chat/hooks/use-delete-chat';
import { useGetChats } from '@/features/chat/hooks/use-get-chats';
import { AppRoutes } from '@/shared/constants/router';

export const useSidebarContentLogic = () => {
  const { chats, isLoading } = useGetChats();
  const navigate = useNavigate();
  const location = useLocation();
  const { deleteChat, isLoading: isDeleting } = useDeleteChat();

  const handleDelete = async (chatId: string) => {
    await deleteChat(chatId);

    const currentChatId = location.pathname.split('/').pop();
    const updatedChats = (chats || []).filter(c => c.id !== chatId);

    if (currentChatId === chatId) {
      if (updatedChats.length > 0) {
        const currentSearch = location.search;
        navigate(`${AppRoutes.Chat(updatedChats[updatedChats.length - 1].id)}${currentSearch}`);
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
  };
};
