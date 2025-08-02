import LLMResponse from '@/features/Chat/components/LLMResponse/LLMResponse';
import { useMessageListLogic } from '@/features/Chat/components/MessageList/useMessageListLogic';
import UserMessage from '@/features/Chat/components/UserMessage/UserMessage';
import { ScrollArea } from '@/shared/components/ScrollArea';

const MessageList = () => {
  const {
    messages,
    scrollAreaRef,
    handleScroll,
    handleCopyText,
    handleReply,
    handleNewAttachedBranch,
    handleNewDetachedBranch,
    handleNewTemporaryBranch,
    handleNewSetOfBranches,
    handleOpenBranch,
    handleOpenInSidePanel,
    handleOpenInNewTab,
    handleNewNote,
  } = useMessageListLogic();

  return (
    <ScrollArea
      ref={scrollAreaRef}
      onScroll={handleScroll}
      className="flex flex-1 flex-col gap-2.5"
    >
      {messages?.map((message, index) => {
        const { id, content } = message;
        const isLastMessage = index === messages.length - 1;

        if (message.role === 'user') {
          return (
            <UserMessage
              key={id}
              content={content}
              onCopyText={handleCopyText}
              onReply={() => handleReply(id)}
              onNewAttachedBranch={() => handleNewAttachedBranch(id, content)}
              onNewDetachedBranch={() => handleNewDetachedBranch(id, content)}
              onNewTemporaryBranch={() => handleNewTemporaryBranch(id, content)}
              onNewSetOfBranches={() => handleNewSetOfBranches(id)}
            />
          );
        }

        return (
          <LLMResponse
            key={id}
            {...message}
            isLastMessage={isLastMessage}
            onCopyText={handleCopyText}
            onReply={() => handleReply(id)}
            onOpenBranch={() => handleOpenBranch(id)}
            onOpenInSidePanel={() => handleOpenInSidePanel(id)}
            onOpenInNewTab={() => handleOpenInNewTab(id)}
            onNewAttachedBranch={() => handleNewAttachedBranch(id, content)}
            onNewDetachedBranch={() => handleNewDetachedBranch(id, content)}
            onNewTemporaryBranch={() => handleNewTemporaryBranch(id, content)}
            onNewSetOfBranches={() => handleNewSetOfBranches(id)}
            onNewNote={() => handleNewNote(id)}
          />
        );
      })}
    </ScrollArea>
  );
};

export default MessageList;
