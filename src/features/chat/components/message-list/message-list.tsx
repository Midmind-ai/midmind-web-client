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
    replyToMessage,
    createAttachedBranch,
    createDetachedBranch,
    createTemporaryBranch,
    createNewBranchSet,
    openChatInMainView,
    openChatInSidePanel,
    openChatInNewTab,
    createNoteFromMessage,
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
              onReply={() => replyToMessage(id)}
              onNewAttachedBranch={() => createAttachedBranch(id, content)}
              onNewDetachedBranch={() => createDetachedBranch(id, content)}
              onNewTemporaryBranch={() => createTemporaryBranch(id, content)}
              onNewSetOfBranches={() => createNewBranchSet(id)}
            />
          );
        }

        return (
          <LLMResponse
            key={id}
            {...message}
            isLastMessage={isLastMessage}
            onCopyText={copyText}
            onReply={() => replyToMessage(id)}
            onOpenBranch={() => openChatInMainView(id)}
            onOpenInSidePanel={() => openChatInSidePanel(id)}
            onOpenInNewTab={() => openChatInNewTab(id)}
            onNewAttachedBranch={branchContext =>
              createAttachedBranch(id, content, branchContext)
            }
            onNewDetachedBranch={branchContext =>
              createDetachedBranch(id, content, branchContext)
            }
            onNewTemporaryBranch={() => createTemporaryBranch(id, content)}
            onNewSetOfBranches={() => createNewBranchSet(id)}
            onNewNote={() => createNoteFromMessage(id)}
          />
        );
      })}
    </ScrollArea>
  );
};

export default MessageList;
