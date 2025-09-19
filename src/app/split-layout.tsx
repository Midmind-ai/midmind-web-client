import { Outlet, useParams, useLocation } from 'react-router';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@components/ui/resizable';
import { LocalStorageKeys } from '@constants/local-storage';
import { AppRoutes, SearchParams } from '@constants/paths';
import Chat from '@features/chat/chat';
import { navigate, useInitializeNavigation } from '@hooks/use-navigation';
import { useUrlParams } from '@hooks/utils/use-url-params';
import { cn } from '@utils/cn';
import { getFromStorage, setToStorage } from '@utils/local-storage';

const SplitLayout = () => {
  useInitializeNavigation();

  const { id: currentChatId = '' } = useParams<{ id: string }>();
  const { value: chatId = '', removeValue } = useUrlParams(SearchParams.Split);
  const location = useLocation();

  const sidePanelWidth = getFromStorage<number>(LocalStorageKeys.SidePanelWidth) || 50;
  const isOnChatPage = !!currentChatId && location.pathname.startsWith('/chats/');

  const handleResize = (size: number) => {
    setToStorage(LocalStorageKeys.SidePanelWidth, size);
  };

  const handleCloseLeftPanel = () => {
    if (chatId) navigate(AppRoutes.Chat(chatId));
  };

  const handleCloseRightPanel = () => {
    removeValue();
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        id="main-panel"
        order={1}
        minSize={35}
        className={cn(chatId ? 'w-1/2' : 'w-full')}
      >
        {isOnChatPage ? (
          <Chat
            chatId={currentChatId}
            showCloseButton={!!chatId}
            showSidebarToggle={true}
            onClose={handleCloseLeftPanel}
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
            />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};

export default SplitLayout;
