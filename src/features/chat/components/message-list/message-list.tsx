import LLMResponse from '@features/chat/components/llm-response/llm-response';
import { useMessageListLogic } from '@features/chat/components/message-list/use-message-list-logic';
import UserMessage from '@features/chat/components/user-message/user-message';

import { ScrollArea } from '@/components/ui/scroll-area';

type Props = {
  chatId: string;
};

const MessageList = ({ chatId }: Props) => {
  const { messages, chatActions, messageActions, scrollAreaRef, handleScroll } =
    useMessageListLogic(chatId);

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className="h-full"
      onScroll={handleScroll}
    >
      <div className="mx-auto flex w-full max-w-[768px] flex-col gap-2.5 pt-9">
        {messages?.map((message, index) => {
          const { id, content } = message;
          const isLastMessage = index === messages.length - 1;

          if (message.role === 'user') {
            return (
              <UserMessage
                key={id}
                {...message}
                onCopyText={() => messageActions.copyText(content)}
                onReply={() => messageActions.replyToMessage(id, content)}
                onNewAttachedBranch={() => chatActions.createAttachedBranch(id, content)}
                onNewDetachedBranch={() => chatActions.createDetachedBranch(id, content)}
                onNewTemporaryBranch={() => {
                  chatActions.createTemporaryBranch(id, content);
                }}
                onNewSetOfBranches={() => chatActions.createNewBranchSet(id)}
              />
            );
          }

          return (
            <LLMResponse
              key={id}
              {...message}
              isLastMessage={isLastMessage}
              onCopyText={() => messageActions.copyText(content)}
              onReply={() => messageActions.replyToMessage(id, content)}
              onOpenBranch={() => {}}
              onOpenInSidePanel={(branchChatId: string) => {
                chatActions.openChatInSidePanel(branchChatId);
              }}
              onOpenInNewTab={() => chatActions.openChatInNewTab(id)}
              onNewAttachedBranch={branchContext => {
                chatActions.createAttachedBranch(id, content, branchContext);
              }}
              onNewDetachedBranch={branchContext => {
                chatActions.createDetachedBranch(id, content, branchContext);
              }}
              onNewTemporaryBranch={() => chatActions.createTemporaryBranch(id, content)}
              onNewSetOfBranches={() => chatActions.createNewBranchSet(id)}
              onNewNote={() => {}}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default MessageList;
