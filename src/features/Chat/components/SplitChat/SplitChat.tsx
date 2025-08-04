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

type SplitChatProps = {
  parentChatId: string;
  childChatId: string;
  threadContext: ConversationWithAIRequest['thread_context'];
  isParentFullscreen: boolean;
  isChildFullscreen: boolean;
  onToggleParentFullscreen: () => void;
  onToggleChildFullscreen: () => void;
};

const SplitChat = ({
  parentChatId,
  childChatId,
  threadContext,
  isParentFullscreen,
  isChildFullscreen,
  onToggleParentFullscreen,
  onToggleChildFullscreen,
}: SplitChatProps) => {
  const { messages: parentMessages } = useGetChatMessages(parentChatId);
  const { messages: childMessages } = useGetChatMessages(childChatId);
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

  const getParentContainerClasses = () => {
    if (isParentFullscreen) {
      return 'flex flex-col w-full';
    }
    if (isChildFullscreen) {
      return 'hidden';
    }

    return 'flex flex-col w-1/2 border-r border-border';
  };

  const getChildContainerClasses = () => {
    if (isChildFullscreen) {
      return 'flex flex-col w-full';
    }
    if (isParentFullscreen) {
      return 'hidden';
    }

    return 'flex flex-col w-1/2';
  };

  return (
    <div className="flex h-screen">
      <div className={getParentContainerClasses()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Parent Chat</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleParentFullscreen}
            aria-label={isParentFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isParentFullscreen ? <Minimize2 size={16} /> : <Expand size={16} />}
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              {parentMessages?.map((message, index) =>
                renderMessage(message, index, parentMessages)
              )}
            </div>
          </ScrollArea>
        </div>
        <ChatMessageForm chatId={parentChatId} />
      </div>
      <div className={getChildContainerClasses()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Child Chat</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleChildFullscreen}
            aria-label={isChildFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isChildFullscreen ? <Minimize2 size={16} /> : <Expand size={16} />}
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              {childMessages?.map((message, index) => renderMessage(message, index, childMessages))}
            </div>
          </ScrollArea>
        </div>

        <ChatMessageForm
          chatId={childChatId}
          threadContext={threadContext}
        />
      </div>
    </div>
  );
};

export default SplitChat;
