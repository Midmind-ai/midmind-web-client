import { useEffect } from 'react';

import { ContextMenu, ContextMenuTrigger } from '@components/ui/context-menu';
import { ThemedP } from '@components/ui/themed-p';

import MessageContextMenu from '@features/chat/components/message-context-menu/message-context-menu';
import MessageReply from '@features/chat/components/message-reply/message-reply';

type Props = {
  content: string;
  isLastMessage: boolean;
  reply_content: string | null;
  onCopyText: VoidFunction;
  onReply: VoidFunction;
  onNewAttachedBranch: VoidFunction;
  onNewDetachedBranch: VoidFunction;
  onNewTemporaryBranch: VoidFunction;
  onNewSetOfBranches: VoidFunction;
  onAutoScroll: VoidFunction;
};

const UserMessage = ({
  content,
  isLastMessage,
  reply_content,
  onCopyText,
  onReply,
  onNewAttachedBranch,
  onNewDetachedBranch,
  onNewTemporaryBranch,
  onNewSetOfBranches,
  onAutoScroll,
}: Props) => {
  useEffect(() => {
    if (isLastMessage) {
      onAutoScroll();
    }
  }, [onAutoScroll, isLastMessage]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="group data-[state=open]:bg-muted/50 w-full rounded-md bg-transparent
            p-2.5 transition-colors duration-100"
        >
          <div className="ml-auto w-fit max-w-[465px]">
            {reply_content && (
              <MessageReply
                content={reply_content}
                className="mx-4 shadow-md"
                placement="message"
              />
            )}
            <div className="bg-accent rounded-[10px] p-2.5 shadow-sm select-text">
              <ThemedP className="text-base font-light">{content}</ThemedP>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <MessageContextMenu
        onCopyText={onCopyText}
        onReply={onReply}
        onNewAttachedBranch={onNewAttachedBranch}
        onNewDetachedBranch={onNewDetachedBranch}
        onNewTemporaryBranch={onNewTemporaryBranch}
        onNewSetOfBranches={onNewSetOfBranches}
      />
    </ContextMenu>
  );
};

export default UserMessage;
