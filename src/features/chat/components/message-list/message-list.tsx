import LLMResponse from '@features/chat/components/llm-response/llm-response';
import { useMessageListLogic } from '@features/chat/components/message-list/use-message-list-logic';
import UserMessage from '@features/chat/components/user-message/user-message';

type Props = {
  chatId: string;
};

const MessageList = ({ chatId }: Props) => {
  const { messages, chatActions, messageActions } = useMessageListLogic(chatId);

  return (
    <div className="flex flex-col gap-2.5">
      {messages?.map((message, index) => {
        const { id, content } = message;
        const isLastMessage = index === messages.length - 1;

        if (message.role === 'user') {
          return (
            <UserMessage
              key={id}
              content={content}
              onCopyText={() => messageActions.copyText(content)}
              onReply={() => messageActions.replyToMessage(id)}
              onNewAttachedBranch={() => chatActions.createAttachedBranch(id, content)}
              onNewDetachedBranch={() => chatActions.createDetachedBranch(id, content)}
              onNewTemporaryBranch={() => chatActions.createTemporaryBranch(id, content)}
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
            onReply={() => messageActions.replyToMessage(id)}
            onOpenBranch={() => {}}
            onOpenInSidePanel={() => chatActions.openChatInSidePanel(id)}
            onOpenInNewTab={() => chatActions.openChatInNewTab(id)}
            onNewAttachedBranch={branchContext =>
              chatActions.createAttachedBranch(id, content, branchContext)
            }
            onNewDetachedBranch={branchContext =>
              chatActions.createDetachedBranch(id, content, branchContext)
            }
            onNewTemporaryBranch={() => chatActions.createTemporaryBranch(id, content)}
            onNewSetOfBranches={() => chatActions.createNewBranchSet(id)}
            onNewNote={() => {}}
          />
        );
      })}
    </div>
  );
};

export default MessageList;
