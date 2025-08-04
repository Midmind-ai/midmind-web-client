import { Expand, Minimize2 } from 'lucide-react';

import ChatMessageForm from '@/features/Chat/components/ChatMessageForm/ChatMessageForm';
import LLMResponse from '@/features/Chat/components/LLMResponse/LLMResponse';
import UserMessage from '@/features/Chat/components/UserMessage/UserMessage';
import { useGetChatMessages } from '@/features/Chat/hooks/useGetChatMessages';
import { useMessageHandlers } from '@/features/Chat/hooks/useMessageHandlers';
import { Button } from '@/shared/components/Button';
import { ScrollArea } from '@/shared/components/ScrollArea';
import type { ConversationWithAIRequest } from '@/shared/services/chats/types';
import type { ChatMessage } from '@/shared/types/entities';
import { cn } from '@/shared/utils/cn';

type ChildChatProps = {
  chatId: string;
  threadContext: ConversationWithAIRequest['thread_context'];
  isFullscreen: boolean;
  isHidden: boolean;
  onToggleFullscreen: () => void;
};

const ChildChat = ({
  chatId,
  threadContext,
  isFullscreen,
  isHidden,
  onToggleFullscreen,
}: ChildChatProps) => {
  const { messages } = useGetChatMessages(chatId);
  const handlers = useMessageHandlers();

  const renderMessage = (message: ChatMessage, index: number, messages: ChatMessage[]) => {
    const isLastMessage = index === messages.length - 1;

    if (message.role === 'user') {
      return (
        <UserMessage
          key={message.id}
          content={message.content}
          onCopyText={handlers.handleCopyText}
          onReply={() => handlers.handleReply(message.id)}
          onNewAttachedBranch={() => handlers.handleNewAttachedBranch(message.id, message.content)}
          onNewDetachedBranch={() => handlers.handleNewDetachedBranch(message.id, message.content)}
          onNewTemporaryBranch={() =>
            handlers.handleNewTemporaryBranch(message.id, message.content)
          }
          onNewSetOfBranches={() => handlers.handleNewSetOfBranches(message.id)}
        />
      );
    }

    return (
      <LLMResponse
        key={message.id}
        {...message}
        isLastMessage={isLastMessage}
        onCopyText={handlers.handleCopyText}
        onReply={() => handlers.handleReply(message.id)}
        onOpenBranch={() => handlers.handleOpenBranch(message.id)}
        onOpenInSidePanel={() => handlers.handleOpenInSidePanel(message.id)}
        onOpenInNewTab={() => handlers.handleOpenInNewTab(message.id)}
        onNewAttachedBranch={() => handlers.handleNewAttachedBranch(message.id, message.content)}
        onNewDetachedBranch={() => handlers.handleNewDetachedBranch(message.id, message.content)}
        onNewTemporaryBranch={() => handlers.handleNewTemporaryBranch(message.id, message.content)}
        onNewSetOfBranches={() => handlers.handleNewSetOfBranches(message.id)}
        onNewNote={() => handlers.handleNewNote(message.id)}
      />
    );
  };

  const getContainerClasses = () => {
    if (isFullscreen) {
      return cn('flex flex-col w-full');
    }
    if (isHidden) {
      return cn('hidden');
    }

    return cn('flex flex-col w-1/2');
  };

  const getContentClasses = () => {
    if (isFullscreen) {
      return cn('flex-1 overflow-hidden');
    }

    return cn('flex-1 overflow-hidden');
  };

  const getContentWrapperClasses = () => {
    if (isFullscreen) {
      return cn('max-w-[768px] mx-auto w-full');
    }

    return cn('');
  };

  return (
    <div className={getContainerClasses()}>
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="text-lg font-semibold">Child Chat</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Expand size={16} />}
        </Button>
      </div>
      <div className={getContentClasses()}>
        <ScrollArea className="h-full">
          <div className={cn('p-4', getContentWrapperClasses())}>
            {messages?.map((message, index) => renderMessage(message, index, messages))}
          </div>
        </ScrollArea>
      </div>

      <div className={cn(isFullscreen && 'max-w-[768px] mx-auto w-full', 'pb-3')}>
        <ChatMessageForm
          chatId={chatId}
          threadContext={threadContext}
        />
      </div>
    </div>
  );
};

export default ChildChat;
