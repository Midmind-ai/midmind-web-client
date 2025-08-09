import { ScrollArea } from '@shared/components/ui/scroll-area';

import { copyText } from '@shared/utils/copy-text';

import LLMResponse from '@features/chat/components/llm-response/llm-response';
import { useMessageListLogic } from '@features/chat/components/message-list/use-message-list-logic';
import UserMessage from '@features/chat/components/user-message/user-message';

type Props = {
  chatId: string;
};

const MessageList = ({ chatId }: Props) => {
  const {
    messages,
    scrollAreaRef,
    handleScroll,
    handleReply,
    handleNewAttachedBranch,
    handleNewDetachedBranch,
    handleNewTemporaryBranch,
    createNewSetOfBranches,
    openChat,
    openChatInSidePanel,
    openChatInNewTab,
    handleNewNote,
  } = useMessageListLogic(chatId);

  return (
    <ScrollArea
      ref={scrollAreaRef}
      onScroll={handleScroll}
      className="flex flex-1 flex-col gap-2.5 pt-8"
    >
      {messages?.map((message, index) => {
        const { id, content } = message;
        const isLastMessage = index === messages.length - 1;

        if (message.role === 'user') {
          return (
            <UserMessage
              key={id}
              content={content}
              onCopyText={copyText}
              onReply={() => handleReply(id)}
              onNewAttachedBranch={() => handleNewAttachedBranch(id, content)}
              onNewDetachedBranch={() => handleNewDetachedBranch(id, content)}
              onNewTemporaryBranch={() => handleNewTemporaryBranch(id, content)}
              onNewSetOfBranches={() => createNewSetOfBranches(id)}
            />
          );
        }

        return (
          <LLMResponse
            key={id}
            {...message}
            isLastMessage={isLastMessage}
            onCopyText={copyText}
            onReply={() => handleReply(id)}
            onOpenBranch={() => openChat(id)}
            onOpenInSidePanel={() => openChatInSidePanel(id)}
            onOpenInNewTab={() => openChatInNewTab(id)}
            onNewAttachedBranch={branchContext =>
              handleNewAttachedBranch(id, content, branchContext)
            }
            onNewDetachedBranch={branchContext =>
              handleNewDetachedBranch(id, content, branchContext)
            }
            onNewTemporaryBranch={() => handleNewTemporaryBranch(id, content)}
            onNewSetOfBranches={() => createNewSetOfBranches(id)}
            onNewNote={() => handleNewNote(id)}
          />
        );
      })}
    </ScrollArea>
  );
};

export default MessageList;
