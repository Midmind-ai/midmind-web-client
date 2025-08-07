import ChildChat from '@features/Chat/components/ChildChat/ChildChat';
import ParentChat from '@features/Chat/components/ParentChat/ParentChat';

import type { ConversationWithAIRequestDto } from '@/shared/services/conversations/conversations.dto';

type Props = {
  parentChatId: string;
  childChatId: string;
  threadContext: ConversationWithAIRequestDto['thread_context'];
  isParentFullscreen: boolean;
  isChildFullscreen: boolean;
  onToggleParentFullscreen: VoidFunction;
  onToggleChildFullscreen: VoidFunction;
};

const SplitChat = ({
  parentChatId,
  childChatId,
  threadContext,
  isParentFullscreen,
  isChildFullscreen,
  onToggleParentFullscreen,
  onToggleChildFullscreen,
}: Props) => {
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
