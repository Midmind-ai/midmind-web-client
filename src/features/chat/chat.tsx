import { useEffect, memo } from 'react';
import ChatInput from './components/chat-input/chat-input';
import Messages from './components/messages/messages';
import MessagesSkeleton from './components/messages/messages-skeleton';
import { useChatsStore } from './stores/chats.store';
import NavigationHeader from '@components/misc/navigation-header/navigation-header';
import { usePageTitle } from '@hooks/utils/use-page-title';

type Props = {
  chatId: string;
  showCloseButton?: boolean;
  showSidebarToggle?: boolean;
  onClose?: VoidFunction;
};

const Chat = ({ chatId, showCloseButton, showSidebarToggle, onClose }: Props) => {
  const chatState = useChatsStore(state => state.chats[chatId]);
  const initChatData = useChatsStore(state => state.initChatData);
  const removeChatFromActive = useChatsStore(state => state.removeChatFromActive);

  const chatDetails = chatState?.chat;
  const messages = chatState?.messages || [];
  const isLoadingChat = chatState?.isLoadingChat || false;
  const isLoadingMessages = chatState?.isLoadingMessages || false;
  const isStreaming = chatState?.isStreaming || false;

  // Set page title based on chat name from store
  usePageTitle(chatDetails?.name || '');

  useEffect(() => {
    initChatData(chatId);

    return () => {
      removeChatFromActive(chatId);
    };
  }, [chatId, initChatData, removeChatFromActive]);

  return (
    <div className="@container flex h-screen flex-col">
      <NavigationHeader
        id={chatId}
        showCloseButton={showCloseButton}
        showSidebarToggle={showSidebarToggle}
        onClose={onClose}
      />
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
