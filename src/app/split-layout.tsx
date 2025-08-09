import { Outlet } from 'react-router';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@shared/components/ui/resizable';

import { SearchParams } from '@shared/constants/router';

import { useUrlParams } from '@shared/hooks/use-url-params';

import { cn } from '@shared/utils/cn';

import ChatView from '@features/chat/components/chat-view/chat-view';
import { useBranchContext } from '@features/chat/hooks/use-branch-context';

const SplitLayout = () => {
  const { value: chatId = '' } = useUrlParams(SearchParams.Split);
  const { branchContext } = useBranchContext(chatId);

  return (
    <ResizablePanelGroup
      className="flex flex-1"
      direction="horizontal"
    >
      <ResizablePanel
        id="main-panel"
        order={1}
        minSize={40}
        className={cn(chatId ? 'w-1/2' : 'w-full')}
      >
        <Outlet />
      </ResizablePanel>
      <ResizableHandle />
      {chatId && (
        <ResizablePanel
          id="split-chat-panel"
          order={2}
          minSize={40}
          className="w-1/2"
        >
          <ChatView
            chatId={chatId}
            branchContext={branchContext}
            showCloseButton={true}
          />
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
};

export default SplitLayout;
