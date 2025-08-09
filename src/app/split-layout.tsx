import { Outlet } from 'react-router';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@shared/components/ui/resizable';

import { SearchParams } from '@shared/constants/router';

import { useUrlParams } from '@shared/hooks/use-url-params';

import { cn } from '@shared/utils/cn';

import Chat from '@features/chat/chat';
import { useBranchContext } from '@features/chat/hooks/use-branch-context';

import { LocalStorageKeys } from '@/shared/constants/local-storage';
import { getFromStorage, setToStorage } from '@/shared/utils/local-storage';

const SplitLayout = () => {
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
      <ResizableHandle />
      {chatId && (
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
            onClose={removeValue}
            branchContext={branchContext}
          />
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
};

export default SplitLayout;
