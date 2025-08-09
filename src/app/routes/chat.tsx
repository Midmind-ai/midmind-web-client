import ChatMessageForm from '@features/chat/components/chat-message-form/chat-message-form';
import MessageList from '@features/chat/components/message-list/message-list';

const Chat = () => {
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
