import ChatMessageForm from '@/features/Chat/components/ChatMessageForm/ChatMessageForm';
import MessageList from '@/features/Chat/components/MessageList/MessageList';

const Chat = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <MessageList />
      <ChatMessageForm />
    </div>
  );
};

export default Chat;
