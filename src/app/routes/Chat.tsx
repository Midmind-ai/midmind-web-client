import ChatMessageForm from '@/features/Chat/components/ChatMessageForm/ChatMessageForm';
import MessageList from '@/features/Chat/components/MessageList/MessageList';
import SplitChat from '@/features/Chat/components/SplitChat/SplitChat';
import { useSplitChatLogic } from '@/features/Chat/components/SplitChat/useSplitChatLogic';

const Chat = () => {
  const { isSplitMode, parentChatId, childChatId } = useSplitChatLogic();

  if (isSplitMode && parentChatId && childChatId) {
    return (
      <div className="h-screen">
        <SplitChat
          parentChatId={parentChatId}
          childChatId={childChatId}
        />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto">
      <div className="flex h-full flex-col max-w-[768px] mx-auto w-full">
        <MessageList />
        <div className="sticky bottom-0 bg-background pb-3">
          <ChatMessageForm />
        </div>
      </div>
    </div>
  );
};

export default Chat;
