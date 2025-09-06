import { useEffect, useRef } from 'react';

import { ScrollArea } from '@components/ui/scroll-area';

import { useChatsStore } from '../stores/chats.store';

import AIMessage from './messages/ai-message';
import UserMessage from './messages/user-message';

import type { ChatMessage } from '../types';

type Props = {
  messages: ChatMessage[];
  chatId: string;
  isLoading: boolean;
  isStreaming: boolean;
};

const MessageList = ({ messages, chatId, isLoading, isStreaming }: Props) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const chatState = useChatsStore(state => state.chats[chatId]);
  const loadMoreMessages = useChatsStore(state => state.loadMoreMessages);

  const hasMoreMessages = chatState?.hasMoreMessages || false;
  const streamingMessageId = chatState?.streamingMessageId || null;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (lastMessageRef.current) {
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 0);
    }
  }, [messages.length]);

  // Handle scroll for pagination
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;

    // Load more when scrolled to top
    if (scrollTop < 100 && hasMoreMessages && !isLoading) {
      loadMoreMessages(chatId);
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (!isLoading && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">No messages yet. Start a conversation!</div>
      </div>
    );
  }

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className="h-full"
      onScroll={handleScroll}
    >
      <div className="mx-auto flex max-w-[768px] flex-col gap-3 space-y-0 py-0">
        {hasMoreMessages && (
          <div className="text-center">
            <button
              onClick={() => loadMoreMessages(chatId)}
              className="text-sm text-blue-500 hover:underline"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load more messages'}
            </button>
          </div>
        )}

        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;

          return (
            <div
              key={message.id}
              ref={isLastMessage ? lastMessageRef : null}
            >
              {message.role === 'user' ? (
                <UserMessage message={message} />
              ) : (
                <AIMessage
                  message={message}
                  isLastMessage={isLastMessage}
                  isStreaming={isStreaming}
                  streamingMessageId={streamingMessageId}
                />
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default MessageList;
