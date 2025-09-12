import { PaperclipIcon, SendHorizonal, SquareStopIcon } from 'lucide-react';
import { useState, useRef, useEffect, memo } from 'react';
import { useChatsStore } from '../../stores/chats.store';
import MessageReply from './message-reply';
import ModelSelector from './model-selector';
import { Button } from '@components/ui/button';
import { Textarea } from '@components/ui/textarea';
import type { AIModel } from '@shared-types/entities';
import { useAiModelStore } from '@stores/ai-model.store';

type Props = {
  chatId?: string;
  onSubmit?: (content: string, model: AIModel) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
};

const ChatInput = ({
  chatId,
  onSubmit,
  placeholder = 'Write a message...',
  disabled = false,
}: Props) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // AI model store
  const currentModel = useAiModelStore(state => state.currentModel);

  // Only use chat store if chatId is provided
  const chatState = useChatsStore(state => state.chats[chatId || '']);
  const sendMessage = useChatsStore(state => state.sendMessage);
  const stopStreaming = useChatsStore(state => state.stopStreaming);
  const setReplyContext = useChatsStore(state => state.setReplyContext);

  const isStreaming = chatState?.isStreaming || false;
  const replyContext = chatState?.replyContext;

  // Auto-focus when reply context is set
  useEffect(() => {
    if (replyContext && chatId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyContext, chatId]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isStreaming || disabled) return;

    const messageContent = content.trim();
    setContent('');

    try {
      if (onSubmit) {
        // Use custom onSubmit handler
        await onSubmit(messageContent, currentModel);
        // Clear reply context if using custom handler
        if (chatId && replyContext) {
          setReplyContext(chatId, null);
        }
      } else if (chatId) {
        // Use default chat store behavior (sendMessage will handle and clear replyContext)
        await sendMessage(chatId, messageContent, currentModel);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }

    // Refocus textarea after sending
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleStop = () => {
    if (chatId) stopStreaming(chatId);
  };

  const handleCloseReply = () => {
    if (chatId) {
      setReplyContext(chatId, null);
    }
  };

  return (
    <div>
      {replyContext && (
        <MessageReply
          content={replyContext.content}
          className="mx-2 shadow-md"
          onClose={handleCloseReply}
        />
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-background-accent outline-input flex items-center gap-2 rounded-lg
          p-2 pl-2.5 shadow-sm outline-1 @max-[840px]:rounded-none"
      >
        <ModelSelector
          disabled={isStreaming || disabled}
          onModelChange={() => {
            setTimeout(() => {
              textareaRef?.current?.focus();
            }, 50);
          }}
        />

        <Button
          type="button"
          variant="secondary"
          className="my-0.5 size-8 self-end"
          disabled={isStreaming || disabled}
        >
          <PaperclipIcon className="text-secondary-foreground" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          disabled={isStreaming || disabled}
          className="bg-background-accent flex max-h-[600px] resize-none items-center
            overflow-y-auto border-none px-0 py-0 text-base! font-light shadow-none
            focus-visible:ring-0"
          autoFocus
        />

        {isStreaming ? (
          <Button
            type="button"
            className="size-9 self-end"
            onClick={handleStop}
          >
            <SquareStopIcon className="text-background size-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            className="size-9 self-end"
            disabled={!content.trim()}
          >
            <SendHorizonal className="text-background size-4" />
          </Button>
        )}
      </form>
    </div>
  );
};

export default memo(ChatInput);
