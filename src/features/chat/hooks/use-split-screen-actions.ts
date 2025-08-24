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

  // Shared navigation functions to break circular dependencies
  const openChatInNewTab = (chatId: string) => {
    window.open(AppRoutes.Chat(chatId), '_blank');
  };

  const openChatInSidePanel = (chatId: string) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set(SearchParams.Split, chatId);
    navigate(`${location.pathname}${currentUrl.search}`);
  };

  const navigateToChat = (chatId: string) => {
    const currentSearch = window.location.search;
    navigate(`${AppRoutes.Chat(chatId)}${currentSearch}`);
  };

  return {
    openChatInSplitView,
    openChatInNewTab,
    openChatInSidePanel,
    navigateToChat,
  };
};
