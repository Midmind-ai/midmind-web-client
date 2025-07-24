import ChatMessageForm from '@/features/Chat/components/ChatMessageForm/ChatMessageForm';
import MessagesList from '@/features/Chat/components/MessagesLits/MessagesList';

const Chat = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <MessagesList />
      <ChatMessageForm />
    </div>
  );
};

export default Chat;
