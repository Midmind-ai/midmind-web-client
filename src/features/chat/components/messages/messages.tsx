import { useRef, memo, useEffect } from 'react';
import { useChatsStore } from '../../stores/chats.store';
import SelectionPopup from '../selection-popup/selection-popup';
import AIMessage from './ai-message';
import UserMessage from './user-message';
import { ScrollArea } from '@components/ui/scroll-area';
import { useGlobalSelectionDetection } from '@features/chat/hooks/use-global-selection-detection';
import { useSelectionStore } from '@features/chat/stores/selection.store';
import type { GetFileResponseDto } from '@services/files/files-dtos';
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
  const { messageId: selectedMessageId, chatId: selectedChatId } = useSelectionStore();

  const hasMoreMessages = chatState?.hasMoreMessages || false;
  const streamingMessageId = chatState?.streamingMessageId || null;
  const fileData = chatState?.attachments || [];

  const fileDataMap = () => {
    return new Map(fileData.map((file: GetFileResponseDto) => [file.id, file]));
  };

  const getFileUrl = (attachmentId: string): string => {
    const fileData = fileDataMap().get(attachmentId);

    return fileData?.download_url || '';
  };

  // Global selection detection hook
  useGlobalSelectionDetection({
    messages,
    chatId,
    isStreaming,
  });

  // Initial scroll to bottom when chat is first loaded (not during pagination)
  useEffect(() => {
    if (
      messages.length > 0 &&
      chatState?.currentPage <= 1 &&
      lastMessageRef.current &&
      !isStreaming
    ) {
      lastMessageRef.current?.scrollIntoView({
        behavior: 'instant',
        block: 'end',
      });
    }
  }, [messages.length, chatState?.currentPage, isStreaming]);

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
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;

          return (
            <div
              key={message.id}
              ref={isLastMessage ? lastMessageRef : null}
              data-last-message={isLastMessage ? 'true' : 'false'}
            >
              {message.role === 'user' ? (
                <UserMessage
                  message={message}
                  getFileUrl={getFileUrl}
                />
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
      {/* Global selection popup - only renders when there's a selection for this chat */}
      {selectedMessageId && selectedChatId === chatId && (
        <SelectionPopup
          messageId={selectedMessageId}
          chatId={selectedChatId}
        />
      )}
    </ScrollArea>
  );
};

export default memo(Messages);
