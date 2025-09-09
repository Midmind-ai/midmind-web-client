import { AppRoutes, SearchParams } from '@constants/paths';
import { navigate } from '@hooks/use-navigation';

export const openChatInSplitView = (newChatId: string, currentChatId?: string) => {
  const currentUrl = new URL(window.location.href);
  const currentSplitChatId = currentUrl.searchParams.get(SearchParams.Split);

  if (currentChatId && currentSplitChatId && currentSplitChatId === currentChatId) {
    currentUrl.searchParams.set(SearchParams.Split, newChatId);
    navigate(`${AppRoutes.Chat(currentChatId)}${currentUrl.search}`);
  } else {
    currentUrl.searchParams.set(SearchParams.Split, newChatId);
    navigate(`${window.location.pathname}${currentUrl.search}`);
  }
};

export const openChatInNewTab = (chatId: string) => {
  window.open(AppRoutes.Chat(chatId), '_blank');
};

export const openChatInSidePanel = (chatId: string) => {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set(SearchParams.Split, chatId);
  navigate(`${window.location.pathname}${currentUrl.search}`);
};

export const navigateToChat = (chatId: string) => {
  const currentSearch = window.location.search;
  navigate(`${AppRoutes.Chat(chatId)}${currentSearch}`);
};
