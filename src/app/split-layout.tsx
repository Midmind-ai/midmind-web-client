import { Outlet } from 'react-router';

import { Separator } from '@shared/components/ui/separator';

import { SearchParams } from '@shared/constants/router';

import { useUrlParams } from '@shared/hooks/use-url-params';

import { cn } from '@shared/utils/cn';

import ChatView from '@features/chat/components/chat-view/chat-view';
import { useBranchContext } from '@features/chat/hooks/use-branch-context';

const SplitLayout = () => {
  const { value: chatId = '' } = useUrlParams(SearchParams.Split);
  const { branchContext } = useBranchContext(chatId);

  return (
    <div className="flex flex-1">
      <div className={cn(chatId ? 'w-1/2' : 'w-full')}>
        <Outlet />
      </div>
      <Separator orientation="vertical" />
      {chatId && (
        <div className="w-1/2">
          <ChatView
            chatId={chatId}
            branchContext={branchContext}
            showCloseButton={true}
          />
        </div>
      )}
    </div>
  );
};

export default SplitLayout;
