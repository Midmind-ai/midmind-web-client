import { useEffect } from 'react';

import NavigationHeader from '@features/navigation-header/navigation-header';

import { usePageTitle } from '@hooks/utils/use-page-title';

import MessageFormEnhanced from './components/message-form-enhanced';
import MessageList from './components/message-list';
import { useChatsStore } from './stores/chats.store';

type Props = {
  chatId: string;
  showCloseButton?: boolean;
  showSidebarToggle?: boolean;
  onClose?: VoidFunction;
};

const Chat = ({ chatId, showCloseButton, showSidebarToggle, onClose }: Props) => {
  const chatState = useChatsStore(state => state.chats[chatId]);
  const loadChat = useChatsStore(state => state.loadChat);
  const loadMessages = useChatsStore(state => state.loadMessages);
  const addChatToActive = useChatsStore(state => state.addChatToActive);
  const removeChatFromActive = useChatsStore(state => state.removeChatFromActive);

  const chatDetails = chatState?.chat;
  const messages = chatState?.messages || [];
  const isLoadingChat = chatState?.isLoadingChat || false;
  const isLoadingMessages = chatState?.isLoadingMessages || false;
  const isStreaming = chatState?.isStreaming || false;
  const error = chatState?.error;

  usePageTitle(chatDetails?.name || '');

  useEffect(() => {
    addChatToActive(chatId);
    loadChat(chatId);
    loadMessages(chatId);

    return () => {
      removeChatFromActive(chatId);
    };
  }, [chatId, addChatToActive, loadChat, loadMessages, removeChatFromActive]);

  if (!chatState || isLoadingChat) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <NavigationHeader
        id={chatId}
        showCloseButton={showCloseButton}
        showSidebarToggle={showSidebarToggle}
        onClose={onClose}
      />
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          chatId={chatId}
          isLoading={isLoadingMessages}
          isStreaming={isStreaming}
        />
      </div>
      <div className="mx-auto w-full max-w-[768px] pb-3">
        <MessageFormEnhanced chatId={chatId} />
      </div>
    </div>
  );
};

export default Chat;
