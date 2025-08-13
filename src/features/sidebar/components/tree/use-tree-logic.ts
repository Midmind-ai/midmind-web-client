import { useNavigate, useParams } from 'react-router';

import { AppRoutes } from '@/constants/router';
import type { TreeItem } from '@/types/entities';

export const useTreeLogic = (item: TreeItem) => {
  const [{ name, id }, ...items] = Array.isArray(item) ? item : [item];

  const navigate = useNavigate();
  const { id: chatId = '' } = useParams();

  const isActive = id === chatId;

  const handleOpenChat = () => {
    const currentSearch = window.location.search;

    navigate(`${AppRoutes.Chat(id)}${currentSearch}`);
  };

  return {
    name,
    id,
    items,
    isActive,
    handleOpenChat,
  };
};
