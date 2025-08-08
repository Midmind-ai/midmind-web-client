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
        <div className="w-full bg-transparent p-2.5 data-[state=open]:bg-muted/50 transition-colors duration-200">
          <div className="bg-accent max-w-[465px] w-fit p-2.5 rounded-[10px] ml-auto select-text">
            <ThemedP className="font-light text-base">{content}</ThemedP>
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
