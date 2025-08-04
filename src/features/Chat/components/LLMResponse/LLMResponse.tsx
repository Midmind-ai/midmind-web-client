import { FilePlus, GitBranchPlus, GitCommitVertical, Glasses } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import ConnectionTypeBadge from '@/features/Chat/components/ConnectionTypeBadge/ConnectionTypeBadge';
import { useLLMResponseLogic } from '@/features/Chat/components/LLMResponse/useLLMResponseLogic';
import MessageContextMenu from '@/features/Chat/components/MessageContextMenu/MessageContextMenu';
import QuickActionButton from '@/features/Chat/components/QuickActionButton/QuickActionButton';
import { ContextMenu, ContextMenuTrigger } from '@/shared/components/ContextMenu';
import { ThemedP } from '@/shared/components/ThemedP';
import type { ChatMessage } from '@/shared/types/entities';

type Props = {
  content: string;
  id: string;
  llm_model: string | null;
  threads: ChatMessage['threads'];
  isLastMessage: boolean;
  onCopyText: VoidFunction;
  onReply: VoidFunction;
  onOpenBranch: VoidFunction;
  onOpenInSidePanel: VoidFunction;
  onOpenInNewTab: VoidFunction;
  onNewAttachedBranch: VoidFunction;
  onNewDetachedBranch: VoidFunction;
  onNewTemporaryBranch: VoidFunction;
  onNewSetOfBranches: VoidFunction;
  onNewNote: VoidFunction;
};

const LLMResponse = ({
  content,
  id,
  llm_model,
  threads,
  isLastMessage,
  onCopyText,
  onReply,
  onOpenBranch,
  onOpenInSidePanel,
  onOpenInNewTab,
  onNewAttachedBranch,
  onNewDetachedBranch,
  onNewTemporaryBranch,
  onNewSetOfBranches,
  onNewNote,
}: Props) => {
  const { currentModel, streamingContent, isStreaming } = useLLMResponseLogic(
    id,
    content,
    isLastMessage
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger
        disabled={isStreaming}
        asChild
      >
        <div className="w-full bg-transparent p-2.5 data-[state=open]:bg-muted/50 transition-colors duration-200">
          <h6 className="text-blue-500 text-xs font-medium uppercase mb-4">
            {llm_model || currentModel}
          </h6>
          <div className="text-sm font-light leading-relaxed">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <ThemedP className="text-sm font-light leading-7 mb-4 text-gray-700 dark:text-gray-300">
                    {children}
                  </ThemedP>
                ),
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold mb-3 mt-5 text-gray-900 dark:text-gray-100">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mb-3 mt-4 text-gray-900 dark:text-gray-100">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-base font-semibold mb-2 mt-3 text-gray-900 dark:text-gray-100">
                    {children}
                  </h4>
                ),
                h5: ({ children }) => (
                  <h5 className="text-sm font-semibold mb-2 mt-3 text-gray-900 dark:text-gray-100">
                    {children}
                  </h5>
                ),
                h6: ({ children }) => (
                  <h6 className="text-xs font-semibold mb-2 mt-3 text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                    {children}
                  </h6>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc mb-4 space-y-2 ml-4 text-gray-700 dark:text-gray-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal mb-4 space-y-2 ml-4 text-gray-700 dark:text-gray-300">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm font-light leading-6 marker:text-blue-500 dark:marker:text-blue-400 pl-2">
                    {children}
                  </li>
                ),
                code: ({ children }) => (
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-xs font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4 overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-sm">
                    <code className="text-xs font-mono text-gray-800 dark:text-gray-200 leading-6">
                      {children}
                    </code>
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 italic mb-4 bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r-lg">
                    <div className="text-sm font-light text-gray-700 dark:text-gray-300 leading-6">
                      {children}
                    </div>
                  </blockquote>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900 dark:text-gray-100">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-700 dark:text-gray-300">{children}</em>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                hr: () => <hr className="my-6 border-gray-200 dark:border-gray-700" />,
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    {children}
                  </td>
                ),
              }}
            >
              {streamingContent}
            </ReactMarkdown>
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
            <div className="flex flex-wrap gap-2.5">
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
        onCopyText={onCopyText}
        onReply={onReply}
        onOpenBranch={onOpenBranch}
        onOpenInSidePanel={onOpenInSidePanel}
        onOpenInNewTab={onOpenInNewTab}
        onNewAttachedBranch={onNewAttachedBranch}
        onNewDetachedBranch={onNewDetachedBranch}
        onNewTemporaryBranch={onNewTemporaryBranch}
        onNewSetOfBranches={onNewSetOfBranches}
        showBranchActions
      />
    </ContextMenu>
  );
};

export default LLMResponse;
