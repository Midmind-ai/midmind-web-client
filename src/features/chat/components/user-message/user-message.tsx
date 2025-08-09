import { ContextMenu, ContextMenuTrigger } from '@shared/components/ui/context-menu';
import { ThemedP } from '@shared/components/ui/themed-p';

import MessageContextMenu from '@features/chat/components/message-context-menu/message-context-menu';

type Props = {
  content: string;
  onCopyText: VoidFunction;
  onReply: VoidFunction;
  onNewAttachedBranch: VoidFunction;
  onNewDetachedBranch: VoidFunction;
  onNewTemporaryBranch: VoidFunction;
  onNewSetOfBranches: VoidFunction;
};

const UserMessage = ({
  content,
  onCopyText,
  onReply,
  onNewAttachedBranch,
  onNewDetachedBranch,
  onNewTemporaryBranch,
  onNewSetOfBranches,
}: Props) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="data-[state=open]:bg-muted/50 w-full bg-transparent p-2.5
            transition-colors duration-200"
        >
          <div
            className="bg-accent ml-auto w-fit max-w-[465px] rounded-[10px] p-2.5
              select-text"
          >
            <ThemedP className="text-base font-light">{content}</ThemedP>
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
