import { useParams } from 'react-router';

import Chat from '@features/chat-old/chat';

const ChatOldPage = () => {
  const { id: chatId = '' } = useParams();

  return <Chat chatId={chatId} />;
};

export default ChatOldPage;
