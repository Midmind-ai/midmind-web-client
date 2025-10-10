import { memo } from 'react';
import ChatInput from './components/chat-input/chat-input';
import Messages from './components/messages/messages';
import MessagesSkeleton from './components/messages/messages-skeleton';
import { useChatsStore } from './stores/chats.store';

type Props = {
  chatId: string;
};

const Chat = ({ chatId }: Props) => {
  const chatState = useChatsStore(state => state.chats[chatId]);

  const messages = chatState?.messages || [];
  const isLoadingChat = chatState?.isLoadingChat || false;
  const isLoadingMessages = chatState?.isLoadingMessages || false;
  const isStreaming = chatState?.isStreaming || false;

  return (
    <div className="@container flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        {!chatState || isLoadingChat ? (
          <MessagesSkeleton />
        ) : (
          <Messages
            messages={messages}
            chatId={chatId}
            isLoading={isLoadingMessages}
            isStreaming={isStreaming}
          />
        )}
      </div>
      <div className="mx-auto w-full max-w-[840px] pb-3 @max-[840px]:pb-0">
        <ChatInput chatId={chatId} />
      </div>
    </div>
  );
};

export default memo(Chat);
