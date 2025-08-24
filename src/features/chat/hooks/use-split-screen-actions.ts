import { useLocation, useNavigate, useParams } from 'react-router';

import { AppRoutes, SearchParams } from '@constants/paths';

export const useSplitScreenActions = (actualChatId?: string) => {
  const { id: urlChatId = '' } = useParams();
  const chatId = actualChatId || urlChatId;

  const navigate = useNavigate();
  const location = useLocation();

  const openChatInSplitView = (newChatId: string) => {
    const currentUrl = new URL(window.location.href);
    const currentSplitChatId = currentUrl.searchParams.get(SearchParams.Split);

    if (chatId && currentSplitChatId && currentSplitChatId === chatId) {
      currentUrl.searchParams.set(SearchParams.Split, newChatId);

      navigate(`${AppRoutes.Chat(chatId)}${currentUrl.search}`);
    } else {
      currentUrl.searchParams.set(SearchParams.Split, newChatId);

      navigate(`${location.pathname}${currentUrl.search}`);
    }
  };

  return {
    openChatInSplitView,
  };
};
