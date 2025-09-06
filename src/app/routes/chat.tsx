import { useParams } from 'react-router';

import Chat from '@features/chat/chat';

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg">No chat ID provided</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Chat chatId={id} />
    </div>
  );
};

export default ChatPage;
