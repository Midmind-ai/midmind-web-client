import ChildChat from '@features/Chat/components/ChildChat/ChildChat';
import ParentChat from '@features/Chat/components/ParentChat/ParentChat';

import type { ConversationWithAIRequest } from '@/shared/services/chats/types';

type SplitChatProps = {
  parentChatId: string;
  childChatId: string;
  threadContext: ConversationWithAIRequest['thread_context'];
  isParentFullscreen: boolean;
  isChildFullscreen: boolean;
  onToggleParentFullscreen: () => void;
  onToggleChildFullscreen: () => void;
};

const SplitChat = ({
  parentChatId,
  childChatId,
  threadContext,
  isParentFullscreen,
  isChildFullscreen,
  onToggleParentFullscreen,
  onToggleChildFullscreen,
}: SplitChatProps) => {
  return (
    <div className="flex h-screen">
      <ParentChat
        chatId={parentChatId}
        isFullscreen={isParentFullscreen}
        isHidden={isChildFullscreen}
        onToggleFullscreen={onToggleParentFullscreen}
      />
      <ChildChat
        chatId={childChatId}
        threadContext={threadContext}
        isFullscreen={isChildFullscreen}
        isHidden={isParentFullscreen}
        onToggleFullscreen={onToggleChildFullscreen}
      />
    </div>
  );
};

export default SplitChat;
