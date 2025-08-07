import { FilePlus, GitBranchPlus, GitCommitVertical, Glasses } from 'lucide-react';

import ConnectionTypeBadge from '@/features/Chat/components/ConnectionTypeBadge/ConnectionTypeBadge';
import type { ChatThreadContext } from '@/features/Chat/components/LLMResponse/llm-response.types';
import { useLLMResponseLogic } from '@/features/Chat/components/LLMResponse/useLLMResponseLogic';
import MessageContextMenu from '@/features/Chat/components/MessageContextMenu/MessageContextMenu';
import QuickActionButton from '@/features/Chat/components/QuickActionButton/QuickActionButton';
import ReactMarkdown from '@/features/Chat/components/react-markdown/react-markdown';
import { useTextHighlight } from '@/features/Chat/hooks/use-text-highlight/use-text-highlight';
import { captureSelection } from '@/features/Chat/hooks/use-text-highlight/use-text-highlight.helpers';
import { ContextMenu, ContextMenuTrigger } from '@/shared/components/ContextMenu';
import type { ChatMessage } from '@/shared/types/entities';

type Props = {
  id: string;
  content: string;
  isLastMessage: boolean;
  llm_model: string | null;
  threads: ChatMessage['threads'];
  onReply: VoidFunction;
  onNewNote: VoidFunction;
  onCopyText: VoidFunction;
  onOpenBranch: VoidFunction;
  onOpenInNewTab: VoidFunction;
  onOpenInSidePanel: VoidFunction;
  onNewSetOfBranches: VoidFunction;
  onNewTemporaryBranch: VoidFunction;
  onNewAttachedBranch: (selectionContext?: ChatThreadContext) => void;
  onNewDetachedBranch: (selectionContext?: ChatThreadContext) => void;
};

const LLMResponse = ({
  id,
  content,
  threads,
  llm_model,
  isLastMessage,
  onReply,
  onNewNote,
  onCopyText,
  onOpenBranch,
  onOpenInNewTab,
  onOpenInSidePanel,
  onNewSetOfBranches,
  onNewAttachedBranch,
  onNewDetachedBranch,
  onNewTemporaryBranch,
}: Props) => {
  let selectionContext: ChatThreadContext | undefined;

  const onSelectionClick = (threadId: string) => {
    // eslint-disable-next-line no-alert
    alert(`You clicked on thread: ${threadId}`);
  };
  const { currentModel, streamingContent, isStreaming } = useLLMResponseLogic(
    id,
    content,
    isLastMessage
  );
  const { messageRef } = useTextHighlight({
    threads,
    onSelectionClick,
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger
        disabled={isStreaming}
        asChild
      >
        <div className="group w-full bg-transparent p-2.5 data-[state=open]:bg-muted/50 transition-colors duration-200">
          <h6 className="text-blue-500 text-xs font-medium uppercase mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
            {llm_model || currentModel}
          </h6>
          <div
            ref={messageRef}
            className="text-base font-light leading-relaxed"
            onMouseUp={() => {
              if (messageRef.current) {
                selectionContext = captureSelection(messageRef.current);
              }
            }}
          >
            <ReactMarkdown content={streamingContent} />
          </div>
          <div className="flex items-center gap-2.5 mb-4">
            {threads.map(({ id, connection_color, connection_type, child_chat_id }) => {
              if (connection_type === 'temporary') {
                return null;
              }

              return (
                <ConnectionTypeBadge
                  key={id}
                  bgColor={connection_color}
                  threadChatId={child_chat_id}
                  connectionType={connection_type}
                />
              );
            })}
          </div>
          {!isStreaming && isLastMessage && (
            <div className="flex flex-wrap gap-2.5 mb-8">
              <QuickActionButton
                icon={<GitBranchPlus className="size-6 text-foreground" />}
                label="New attached branch"
                onClick={onNewAttachedBranch}
              />
              <QuickActionButton
                icon={<GitCommitVertical className="size-6 text-foreground" />}
                label="New detached branch"
                onClick={onNewDetachedBranch}
              />
              <QuickActionButton
                icon={<Glasses className="size-6 text-foreground" />}
                label="New temporary branch"
                onClick={onNewTemporaryBranch}
              />
              <QuickActionButton
                icon={<FilePlus className="size-6 text-foreground" />}
                label="Create new note"
                onClick={onNewNote}
              />
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <MessageContextMenu
        onReply={onReply}
        showBranchActions
        onCopyText={onCopyText}
        onOpenBranch={onOpenBranch}
        onOpenInNewTab={onOpenInNewTab}
        onOpenInSidePanel={onOpenInSidePanel}
        onNewSetOfBranches={onNewSetOfBranches}
        onNewTemporaryBranch={onNewTemporaryBranch}
        onNewAttachedBranch={() => onNewAttachedBranch(selectionContext)}
        onNewDetachedBranch={() => onNewDetachedBranch(selectionContext)}
      />
    </ContextMenu>
  );
};

export default LLMResponse;
