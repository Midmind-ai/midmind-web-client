import {
  CopyIcon,
  ExternalLink,
  GitBranchPlus,
  GitCommitVertical,
  GitFork,
  Glasses,
  MessageSquareMore,
  PanelRight,
  ReplyIcon,
} from 'lucide-react';
import {
  ContextMenuItem,
  ContextMenuContent,
  ContextMenuSeparator,
} from '@components/ui/context-menu';
import { ThemedP } from '@components/ui/themed-p';
import { ThemedSpan } from '@components/ui/themed-span';

type Props = {
  onCopyText?: VoidFunction;
  onReply?: VoidFunction;
  onOpenBranch?: VoidFunction;
  onOpenInSidePanel?: VoidFunction;
  onOpenInNewTab?: VoidFunction;
  onNewAttachedBranch?: VoidFunction;
  onNewDetachedBranch?: VoidFunction;
  onNewTemporaryBranch?: VoidFunction;
  onNewSetOfBranches?: VoidFunction;
  showBranchActions?: boolean;
  showNewBranchActions?: boolean;
};

const MessageContextMenu = ({
  onCopyText,
  onReply,
  onOpenBranch,
  onOpenInSidePanel,
  onOpenInNewTab,
  onNewAttachedBranch,
  onNewDetachedBranch,
  onNewTemporaryBranch,
  onNewSetOfBranches,
  showBranchActions = false,
  showNewBranchActions = true,
}: Props) => {
  return (
    <ContextMenuContent>
      <ContextMenuItem onClick={onCopyText}>
        <CopyIcon className="text-foreground size-4" />
        Copy text
      </ContextMenuItem>
      <ContextMenuItem onClick={onReply}>
        <ReplyIcon className="text-foreground size-4" />
        Reply
      </ContextMenuItem>
      {showBranchActions && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onOpenBranch}>
            <MessageSquareMore className="text-foreground size-4" />
            Open branch
          </ContextMenuItem>
          <ContextMenuItem onClick={onOpenInSidePanel}>
            <PanelRight className="text-foreground size-4" />
            Open in side panel
          </ContextMenuItem>
          <ContextMenuItem onClick={onOpenInNewTab}>
            <ExternalLink className="text-foreground size-4" />
            Open in new tab
          </ContextMenuItem>
        </>
      )}
      {showNewBranchActions && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onNewAttachedBranch}>
            <GitBranchPlus className="text-foreground size-4" />
            <ThemedP>
              New <ThemedSpan className="font-medium">attached</ThemedSpan> branch
            </ThemedP>
          </ContextMenuItem>
          <ContextMenuItem onClick={onNewDetachedBranch}>
            <GitCommitVertical className="text-foreground size-4" />
            <ThemedP>
              New <ThemedSpan className="font-medium">detached</ThemedSpan> branch
            </ThemedP>
          </ContextMenuItem>
          <ContextMenuItem onClick={onNewTemporaryBranch}>
            <Glasses className="text-foreground size-4" />
            <ThemedP>
              New <ThemedSpan className="font-medium">temporary</ThemedSpan> branch
            </ThemedP>
          </ContextMenuItem>
          <ContextMenuItem onClick={onNewSetOfBranches}>
            <GitFork className="text-foreground size-4" />
            <ThemedP>
              New <ThemedSpan className="font-medium">set</ThemedSpan> of branches
            </ThemedP>
          </ContextMenuItem>
        </>
      )}
    </ContextMenuContent>
  );
};

export default MessageContextMenu;
