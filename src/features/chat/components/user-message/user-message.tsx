import { ContextMenu, ContextMenuTrigger } from '@components/ui/context-menu';
import { ThemedP } from '@components/ui/themed-p';

import MessageContextMenu from '@features/chat/components/message-context-menu/message-context-menu';
import MessageReply from '@features/chat/components/message-reply/message-reply';
import { useUserMessageLogic } from '@features/chat/components/user-message/use-user-message-logic';
import type { UseMessageSelectionContextT } from '@features/chat/types/chat-types';

type Props = {
  content: string;
  isLastMessage: boolean;
  reply_content: string | null;
  onReply: VoidFunction;
  onCopyText: VoidFunction;
  onAutoScroll: VoidFunction;
  onNewSetOfBranches: VoidFunction;
  onNewTemporaryBranch: VoidFunction;
  onNewAttachedBranch: (selectionContext?: UseMessageSelectionContextT) => void;
  onNewDetachedBranch: (selectionContext?: UseMessageSelectionContextT) => void;
};

const UserMessage = ({
  content,
  isLastMessage,
  reply_content,
  onReply,
  onCopyText,
  onAutoScroll,
  onNewAttachedBranch,
  onNewDetachedBranch,
  onNewTemporaryBranch,
  onNewSetOfBranches,
}: Props) => {
  const { messageRef, getCurrentSelectionContext } = useUserMessageLogic({
    isLastMessage,
    onAutoScroll,
  });

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
            <div
              ref={messageRef}
              className="bg-accent rounded-[10px] p-2.5 shadow-sm select-text"
              onClick={getCurrentSelectionContext}
            >
              <ThemedP className="text-base font-light">{content}</ThemedP>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <MessageContextMenu
        onCopyText={onCopyText}
        onReply={onReply}
        onNewAttachedBranch={() => onNewAttachedBranch(getCurrentSelectionContext())}
        onNewDetachedBranch={() => onNewDetachedBranch(getCurrentSelectionContext())}
        onNewTemporaryBranch={onNewTemporaryBranch}
        onNewSetOfBranches={onNewSetOfBranches}
      />
    </ContextMenu>
  );
};

export default UserMessage;
