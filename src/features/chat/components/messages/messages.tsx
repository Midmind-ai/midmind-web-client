import { useEffect, useRef, memo } from 'react';
import { useChatsStore } from '../../stores/chats.store';
import AIMessage from './ai-message';
import UserMessage from './user-message';
import { ScrollArea } from '@components/ui/scroll-area';
import type { ChatMessage } from '@shared-types/entities';

type Props = {
  messages: ChatMessage[];
  chatId: string;
  isLoading: boolean;
  isStreaming: boolean;
};

const Messages = ({ messages, chatId, isLoading, isStreaming }: Props) => {
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
        lastMessageRef.current?.scrollIntoView({
          behavior: isStreaming ? 'smooth' : 'instant',
          block: 'end',
        });
      }, 0);
    }

    // no need to change behavior of scrolling when isStreaming just finished
    // because smooth animation does not keep up to finish due to behavior change to instant
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      className="[&_[data-slot=scroll-area-thumb]]:bg-border h-full
        [&_[data-slot=scroll-area-scrollbar]]:w-2"
      onScroll={handleScroll}
    >
      <div className="mx-auto flex max-w-[840px] flex-col gap-3 space-y-0 py-0 pt-10">
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
                  chatId={chatId}
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

export default memo(Messages);
