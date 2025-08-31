import { Outlet } from 'react-router';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@components/ui/resizable';

import { LocalStorageKeys } from '@constants/local-storage';
import { SearchParams } from '@constants/paths';

import Chat from '@features/chat/chat';
import { useBranchContext } from '@features/chat/hooks/use-branch-context';

import { useInitializeNavigation } from '@hooks/use-navigation';
import { useUrlParams } from '@hooks/utils/use-url-params';

import { cn } from '@utils/cn';
import { getFromStorage, setToStorage } from '@utils/local-storage';

const SplitLayout = () => {
  useInitializeNavigation();

  const { value: chatId = '', removeValue } = useUrlParams(SearchParams.Split);
  const { branchContext } = useBranchContext(chatId);

  const sidePanelWidth = getFromStorage<number>(LocalStorageKeys.SidePanelWidth) || 50;

  const handleResize = (size: number) => {
    setToStorage(LocalStorageKeys.SidePanelWidth, size);
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        id="main-panel"
        order={1}
        minSize={35}
        className={cn(chatId ? 'w-1/2' : 'w-full')}
      >
        <Outlet />
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
              onClose={removeValue}
              branchContext={branchContext}
            />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};

export default SplitLayout;
