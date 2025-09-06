import { ScrollArea } from '@components/ui/scroll-area';

import LLMResponse from '@features/chat-old/components/llm-response/llm-response';
import { useMessageListLogic } from '@features/chat-old/components/message-list/use-message-list-logic';
import UserMessage from '@features/chat-old/components/user-message/user-message';

type Props = {
  chatId: string;
};

const MessageList = ({ chatId }: Props) => {
  const {
    messages,
    chatActions,
    scrollAreaRef,
    messageActions,
    scrollTargetRef,
    handleScroll,
    handleAutoScroll,
  } = useMessageListLogic(chatId);

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className="h-full"
      onScroll={handleScroll}
    >
      <div className="relative mx-auto flex w-full max-w-[768px] flex-col gap-2.5 pt-9">
        {messages?.map((message, index) => {
          const { id, content, role } = message;

          const isLastMessage = index === messages.length - 1;

          if (role === 'user') {
            return (
              <div
                key={id}
                ref={scrollTargetRef}
              >
                <UserMessage
                  chatId={chatId}
                  {...message}
                  onAutoScroll={handleAutoScroll}
                  onCopyText={() => messageActions.copyText(content)}
                  onReply={() => messageActions.replyToMessage(id, content)}
                  onNewAttachedBranch={selectionContext =>
                    chatActions.createAttachedBranch(id, content, selectionContext)
                  }
                  onNewDetachedBranch={selectionContext =>
                    chatActions.createDetachedBranch(id, content, selectionContext)
                  }
                  onNewTemporaryBranch={() => {
                    chatActions.createTemporaryBranch(id, content);
                  }}
                  onNewSetOfBranches={() => chatActions.createNewBranchSet(id)}
                />
              </div>
            );
          }

          return (
            <LLMResponse
              key={id}
              id={id}
              content={content}
              llm_model={message.llm_model}
              branches={message.nested_chats}
              isLastMessage={isLastMessage}
              onCopyText={() => messageActions.copyText(content)}
              onReply={() => messageActions.replyToMessage(id, content)}
              onOpenBranch={() => {}}
              onOpenInSidePanel={(branchChatId: string) => {
                chatActions.openChatInSidePanel(branchChatId);
              }}
              onOpenInNewTab={() => chatActions.openChatInNewTab(id)}
              onNewAttachedBranch={selectionContext => {
                chatActions.createAttachedBranch(id, content, selectionContext);
              }}
              onNewDetachedBranch={selectionContext => {
                chatActions.createDetachedBranch(id, content, selectionContext);
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
