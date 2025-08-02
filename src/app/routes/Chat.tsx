import ChatMessageForm from '@/features/Chat/components/ChatMessageForm/ChatMessageForm';
import MessageList from '@/features/Chat/components/MessageList/MessageList';

const Chat = () => {
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
