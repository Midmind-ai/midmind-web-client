import { memo } from 'react';
import Branches from './components/branches/branches';
import Markdown from './components/markdown';
import QuickActions from './components/quick-actions/quick-actions';
import TypingDots from './components/typing-dots';
import { AI_MODELS } from '@constants/ai-models';
import { useTextHighlight } from '@features/chat/hooks/use-text-highlight';
import { openChatInSidePanel } from '@hooks/use-split-screen-actions';
import type { ChatMessage } from '@shared-types/entities';
import { cn } from '@utils/cn';

type Props = {
  message: ChatMessage;
  chatId: string;
  isLastMessage: boolean;
  isStreaming: boolean;
  streamingMessageId: string | null;
};

const AIMessage = ({
  message,
  chatId,
  isLastMessage,
  isStreaming,
  streamingMessageId,
}: Props) => {
  const { id, content, llm_model, nested_chats } = message;
  const isCurrentlyStreaming = id === streamingMessageId;
  const isWaiting = isStreaming && !content && isCurrentlyStreaming;

  // Text highlighting hook for existing branch selections
  const { messageRef } = useTextHighlight({
    nested_chats,
    onOpenBranch: (branchChatId: string) => {
      openChatInSidePanel(branchChatId);
    },
  });

  // Get the model name from AI_MODELS constant
  const getModelName = (modelId: string | null | undefined) => {
    if (!modelId) return '';
    const model = Object.values(AI_MODELS).find(m => m.id === modelId);

    return model?.name || modelId;
  };

  return (
    <div
      className={cn(
        'group w-full rounded-md bg-transparent px-5 pt-0 pb-2.5',
        isLastMessage &&
          'min-h-[calc(100vh-var(--navigation-header-height)-var(--chat-form-with-padding-height)-115px)]'
      )}
    >
      <h6
        className="text-muted-foreground mb-4 text-xs font-light uppercase opacity-0
          transition-opacity group-hover:opacity-60"
      >
        {getModelName(llm_model)}
      </h6>

      {isWaiting ? (
        <TypingDots />
      ) : (
        <>
          <div
            ref={messageRef}
            data-message-id={id}
            className="pb-0 text-base leading-relaxed font-light"
          >
            <Markdown content={content || ''} />
          </div>
          <Branches
            chatId={chatId}
            branches={nested_chats}
            messageId={id}
          />
        </>
      )}

      {!isWaiting && !isStreaming && isLastMessage && (
        <QuickActions
          chatId={chatId}
          messageId={id}
        />
      )}
    </div>
  );
};

export default memo(AIMessage);
