import { FilePlus, GitBranchPlus, GitCommitVertical, Glasses } from 'lucide-react';

import QuickActionButton from '../quick-action-button/quick-action-button';

const QuickActions = () => {
  // Placeholder implementations - these will be implemented later with actual store actions
  const handleNewAttachedBranch = () => {
    // TODO: Implement new attached branch creation for messageId: ${messageId}
  };

  const handleNewDetachedBranch = () => {
    // TODO: Implement new detached branch creation for messageId: ${messageId}
  };

  const handleNewTemporaryBranch = () => {
    // TODO: Implement new temporary branch creation for messageId: ${messageId}
  };

  const handleCreateNote = () => {
    // TODO: Implement note creation for messageId: ${messageId}
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

export default QuickActions;
