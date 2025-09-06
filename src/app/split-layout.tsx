import { Outlet, useLocation } from 'react-router';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@components/ui/resizable';

import { LocalStorageKeys } from '@constants/local-storage';
import { AppRoutes, SearchParams } from '@constants/paths';

import Chat from '@features/chat-old/chat';
import { useBranchContext } from '@features/chat-old/hooks/use-branch-context';

import { navigate, useInitializeNavigation } from '@hooks/use-navigation';
import { useUrlParams } from '@hooks/utils/use-url-params';

import { cn } from '@utils/cn';
import { getFromStorage, setToStorage } from '@utils/local-storage';

const SplitLayout = () => {
  useInitializeNavigation();

  const location = useLocation();
  const { value: chatId = '', removeValue } = useUrlParams(SearchParams.Split);

  const { branchContext } = useBranchContext(chatId);

  const sidePanelWidth = getFromStorage<number>(LocalStorageKeys.SidePanelWidth) || 50;
  const isOnChatPage = location.pathname.startsWith('/chats');
  const currentChatId = isOnChatPage ? location.pathname.split('/chats/')[1] : '';

  const handleResize = (size: number) => {
    setToStorage(LocalStorageKeys.SidePanelWidth, size);
  };

  const handleCloseLeftPanel = () => {
    if (chatId) navigate(AppRoutes.Chat(chatId));
  };

  const handleCloseRightPanel = () => {
    removeValue();
  };

  const branchContextData = branchContext
    ? { parent_message_id: branchContext.id }
    : undefined;

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        id="main-panel"
        order={1}
        minSize={35}
        className={cn(chatId ? 'w-1/2' : 'w-full')}
      >
        {isOnChatPage && chatId ? (
          <Chat
            chatId={currentChatId}
            showCloseButton
            showSidebarToggle={false}
            onClose={handleCloseLeftPanel}
            branchContext={branchContextData}
          />
        ) : (
          <Outlet />
        )}
      </ResizablePanel>

      {chatId && (
        <>
          <ResizableHandle />
          <ResizablePanel
            id="side-panel"
            order={2}
            minSize={35}
            onResize={handleResize}
            defaultSize={sidePanelWidth}
            className="w-1/2"
          >
            <Chat
              chatId={chatId}
              showCloseButton
              showSidebarToggle={false}
              onClose={handleCloseRightPanel}
              branchContext={branchContextData}
            />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};

export default SplitLayout;
