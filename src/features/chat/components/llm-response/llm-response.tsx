import { FilePlus, GitBranchPlus, GitCommitVertical, Glasses } from 'lucide-react';

import { ContextMenu, ContextMenuTrigger } from '@shared/components/ui/context-menu';

import type { ChatMessage } from '@shared/types/entities';

import ConnectionTypeBadge from '@features/chat/components/connection-type-badge/connection-type-badge';
import { useLLMResponseLogic } from '@features/chat/components/llm-response/use-llm-response-logic';
import MessageContextMenu from '@features/chat/components/message-context-menu/message-context-menu';
import QuickActionButton from '@features/chat/components/quick-action-button/quick-action-button';
import ReactMarkdown from '@features/chat/components/react-markdown/react-markdown';
import type { ChatBranchContext } from '@features/chat/types/chat-types';

type Props = {
  id: string;
  content: string;
  isLastMessage: boolean;
  llm_model: string | null;
  branches: ChatMessage['branches'];
  onReply: VoidFunction;
  onNewNote: VoidFunction;
  onCopyText: VoidFunction;
  onOpenBranch: VoidFunction;
  onOpenInNewTab: VoidFunction;
  onOpenInSidePanel: VoidFunction;
  onNewSetOfBranches: VoidFunction;
  onNewTemporaryBranch: VoidFunction;
  onNewAttachedBranch: (selectionContext?: ChatBranchContext) => void;
  onNewDetachedBranch: (selectionContext?: ChatBranchContext) => void;
};

const LLMResponse = ({
  id,
  content,
  branches,
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
  const {
    streamingContent,
    isStreaming,
    messageRef,
    selectionContext,
    handleTextSelection,
  } = useLLMResponseLogic(id, content, isLastMessage, branches, onOpenInSidePanel);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        disabled={isStreaming}
        asChild
      >
        <div
          className="group data-[state=open]:bg-muted/50 w-full rounded-md bg-transparent
            p-2.5 transition-colors duration-100"
        >
          <h6
            className="mb-4 text-xs font-medium text-blue-500 uppercase opacity-0
              transition-opacity group-hover:opacity-100"
          >
            {llm_model}
          </h6>
          <div
            ref={messageRef}
            className="text-base leading-relaxed font-light"
            onMouseUp={handleTextSelection}
          >
            <ReactMarkdown content={streamingContent} />
          </div>
          <div className="mb-4 flex items-center gap-2.5">
            {branches.map(({ id, connection_color, connection_type, child_chat_id }) => {
              if (connection_type === 'temporary') {
                return null;
              }

              return (
                <ConnectionTypeBadge
                  key={id}
                  bgColor={connection_color}
                  branchChatId={child_chat_id}
                  connectionType={connection_type}
                />
              );
            })}
          </div>
          {!isStreaming && isLastMessage && (
            <div className="mb-8 flex flex-wrap gap-2.5">
              <QuickActionButton
                icon={<GitBranchPlus className="text-foreground size-6" />}
                label="New attached branch"
                onClick={onNewAttachedBranch}
              />
              <QuickActionButton
                icon={<GitCommitVertical className="text-foreground size-6" />}
                label="New detached branch"
                onClick={onNewDetachedBranch}
              />
              <QuickActionButton
                icon={<Glasses className="text-foreground size-6" />}
                label="New temporary branch"
                onClick={onNewTemporaryBranch}
              />
              <QuickActionButton
                icon={<FilePlus className="text-foreground size-6" />}
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
