import { useParams } from 'react-router';

import ChatView from '@features/chat/components/chat-view/chat-view';

const Chat = () => {
  const { id: chatId = '' } = useParams();

  return <ChatView chatId={chatId} />;
};

export default Chat;
