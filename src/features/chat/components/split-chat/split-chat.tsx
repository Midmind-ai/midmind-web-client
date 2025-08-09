import type { ConversationWithAIRequestDto } from '@shared/services/conversations/conversations-dtos';

import ChildChat from '@features/chat/components/child-chat/child-chat';
import ParentChat from '@features/chat/components/parent-chat/parent-chat';

type Props = {
  parentChatId: string;
  childChatId: string;
  branchContext: ConversationWithAIRequestDto['branch_context'];
  isParentFullscreen: boolean;
  isChildFullscreen: boolean;
  onToggleParentFullscreen: VoidFunction;
  onToggleChildFullscreen: VoidFunction;
};

const SplitChat = ({
  parentChatId,
  childChatId,
  branchContext,
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
        branchContext={branchContext}
        isFullscreen={isChildFullscreen}
        isHidden={isParentFullscreen}
        onToggleFullscreen={onToggleChildFullscreen}
      />
    </div>
  );
};

export default SplitChat;
