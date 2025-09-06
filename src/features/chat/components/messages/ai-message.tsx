import { cn } from '@utils/cn';

import Branches from '../branches/branches';
import ReactMarkdown from '../markdown/react-markdown';
import QuickActions from '../quick-actions/quick-actions';

import TypingDots from './typing-dots';

import type { ChatMessage } from '../../types';

type Props = {
  message: ChatMessage;
  isLastMessage: boolean;
  isStreaming: boolean;
  streamingMessageId: string | null;
};

const AIMessage = ({
  message,
  isLastMessage,
  isStreaming,
  streamingMessageId,
}: Props) => {
  const { id, content, llm_model, nested_chats } = message;
  const isCurrentlyStreaming = id === streamingMessageId;
  const isWaiting = isStreaming && !content && isCurrentlyStreaming;

  return (
    <div
      className={cn(
        'group w-full rounded-md bg-transparent px-2.5 pt-0 pb-2.5',
        isLastMessage &&
          'min-h-[calc(100vh-var(--navigation-header-height)-var(--chat-form-with-padding-height)-115px)]'
      )}
    >
      <h6
        className="text-muted-foreground mb-4 text-xs font-light uppercase opacity-0
          transition-opacity group-hover:opacity-70"
      >
        {llm_model}
      </h6>

      {isWaiting ? (
        <TypingDots />
      ) : (
        <>
          <div className="pb-2 text-base leading-relaxed font-light">
            <ReactMarkdown content={content || ''} />
          </div>
          <Branches branches={nested_chats} />
        </>
      )}

      {!isWaiting && !isStreaming && isLastMessage && <QuickActions />}
    </div>
  );
};

export default AIMessage;
