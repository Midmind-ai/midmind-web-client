import { FilePlus, GitBranchPlus, GitCommitVertical, Glasses } from 'lucide-react';
import { memo } from 'react';
import QuickActionButton from './quick-action-button';
import { createNestedChatAndOpenSplitScreen } from '@actions/chat.actions';

type Props = {
  chatId: string;
  messageId: string;
};

const QuickActions = ({ chatId, messageId }: Props) => {
  const handleNewAttachedBranch = async () => {
    createNestedChatAndOpenSplitScreen({
      parentChatId: chatId,
      parentMessageId: messageId,
      connectionType: 'attached',
      contextType: 'full_message',
    });
  };

  const handleNewDetachedBranch = async () => {
    createNestedChatAndOpenSplitScreen({
      parentChatId: chatId,
      parentMessageId: messageId,
      connectionType: 'detached',
      contextType: 'full_message',
    });
  };

  const handleNewTemporaryBranch = async () => {
    createNestedChatAndOpenSplitScreen({
      parentChatId: chatId,
      parentMessageId: messageId,
      connectionType: 'temporary',
      contextType: 'full_message',
    });
  };

  const handleCreateNote = () => {
    // TODO: Implement note creation functionality
  };

  return (
    <div className="mb-12 flex flex-wrap gap-2.5">
      <QuickActionButton
        icon={<GitBranchPlus className="text-foreground size-6" />}
        label="New attached branch"
        onClick={handleNewAttachedBranch}
      />
      <QuickActionButton
        icon={<GitCommitVertical className="text-foreground size-6" />}
        label="New detached branch"
        onClick={handleNewDetachedBranch}
      />
      <QuickActionButton
        icon={<Glasses className="text-foreground size-6" />}
        label="New temporary branch"
        onClick={handleNewTemporaryBranch}
      />
      <QuickActionButton
        icon={<FilePlus className="text-foreground size-6" />}
        label="Create new note"
        onClick={handleCreateNote}
      />
    </div>
  );
};

export default memo(QuickActions);
