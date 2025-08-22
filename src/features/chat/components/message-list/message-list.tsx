import { ArrowDown } from 'lucide-react';

import { Button } from '@components/ui/button';
import { ScrollArea } from '@components/ui/scroll-area';

import LLMResponse from '@features/chat/components/llm-response/llm-response';
import { useMessageListLogic } from '@features/chat/components/message-list/use-message-list-logic';
import UserMessage from '@features/chat/components/user-message/user-message';

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
    scrollToBottom,
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

          const isLastUserMessage =
            role === 'user' &&
            (index === messages.length - 1 ||
              (index < messages.length - 1 && messages[index + 1]?.role === 'model'));

          const isLastLLMMessage = role === 'model' && index === messages.length - 1;

          if (role === 'user') {
            return (
              <div
                key={id}
                ref={scrollTargetRef}
              >
                <UserMessage
                  {...message}
                  isLastMessage={isLastUserMessage}
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
              {...message}
              isLastMessage={isLastLLMMessage}
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
        <Button
          className="fixed right-6 bottom-[calc(64px+16px)] z-50 h-11 w-11 rounded-full
            shadow-lg hover:shadow-xl"
          size="icon"
          aria-label="Scroll to bottom"
          onClick={() => scrollToBottom(true)}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>
    </ScrollArea>
  );
};

export default MessageList;
