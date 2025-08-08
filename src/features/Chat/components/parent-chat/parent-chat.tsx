import { Expand, Minimize2 } from 'lucide-react';

import ChatMessageForm from '@/features/chat/components/chat-message-form/chat-message-form';
import LLMResponse from '@/features/chat/components/llm-response/llm-response';
import UserMessage from '@/features/chat/components/user-message/user-message';
import { useGetChatMessages } from '@/features/chat/hooks/use-get-chat-messages';
import { useMessageHandlers } from '@/features/chat/hooks/use-message-handlers/use-message-handlers';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import type { ChatMessage } from '@/shared/types/entities';
import { cn } from '@/shared/utils/cn';
import { copyText } from '@/shared/utils/copy-text';

type Props = {
  chatId: string;
  isFullscreen: boolean;
  isHidden: boolean;
  onToggleFullscreen: VoidFunction;
};

const ParentChat = ({ chatId, isFullscreen, isHidden, onToggleFullscreen }: Props) => {
  const { messages } = useGetChatMessages(chatId);
  const handlers = useMessageHandlers();

  const renderMessage = (message: ChatMessage, index: number, messages: ChatMessage[]) => {
    const isLastMessage = index === messages.length - 1;

    if (message.role === 'user') {
      return (
        <UserMessage
          key={message.id}
          content={message.content}
          onCopyText={copyText}
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
        onCopyText={copyText}
        onReply={() => handlers.handleReply(message.id)}
        onOpenBranch={() => handlers.handleOpenBranch(message.id)}
        onOpenInSidePanel={() => handlers.handleOpenInSidePanel(message.id)}
        onOpenInNewTab={() => handlers.handleOpenInNewTab(message.id)}
        onNewAttachedBranch={selectionContext =>
          handlers.handleNewAttachedBranch(message.id, message.content, selectionContext)
        }
        onNewDetachedBranch={selectionContext =>
          handlers.handleNewDetachedBranch(message.id, message.content, selectionContext)
        }
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

    return cn('flex flex-col w-1/2 border-r border-border');
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
        <h2 className="text-lg font-semibold">Parent Chat</h2>
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
          <div className={getContentWrapperClasses()}>
            {messages?.map((message, index) => renderMessage(message, index, messages))}
          </div>
        </ScrollArea>
      </div>
      <div className={cn(isFullscreen && 'max-w-[768px] mx-auto w-full', 'pb-3')}>
        <ChatMessageForm chatId={chatId} />
      </div>
    </div>
  );
};

export default ParentChat;
