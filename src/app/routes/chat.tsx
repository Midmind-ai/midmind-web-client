import ChatMessageForm from '@features/chat/components/chat-message-form/chat-message-form';
import MessageList from '@features/chat/components/message-list/message-list';
import SplitChat from '@features/chat/components/split-chat/split-chat';
import { useSplitChatLogic } from '@features/chat/components/split-chat/use-split-chat-logic';

const Chat = () => {
  const {
    isSplitMode,
    parentChatId,
    childChatId,
    branchContext,
    isParentFullscreen,
    isChildFullscreen,
    handleToggleParentFullscreen,
    handleToggleChildFullscreen,
  } = useSplitChatLogic();

  if (isSplitMode && parentChatId && childChatId) {
    return (
      <div className="h-screen">
        <SplitChat
          parentChatId={parentChatId}
          childChatId={childChatId}
          branchContext={branchContext}
          isParentFullscreen={isParentFullscreen}
          isChildFullscreen={isChildFullscreen}
          onToggleParentFullscreen={handleToggleParentFullscreen}
          onToggleChildFullscreen={handleToggleChildFullscreen}
        />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto">
      <div className="mx-auto flex h-full w-full max-w-[768px] flex-col">
        <MessageList />
        <div className="bg-background sticky bottom-0 pb-3">
          <ChatMessageForm />
        </div>
      </div>
    </div>
  );
};

export default Chat;
