import { useParams } from 'react-router';

import Chat from '@features/chat/chat';

const ChatPage = () => {
  const { id: chatId = '' } = useParams();

  return <Chat chatId={chatId} />;
};

export default ChatPage;
