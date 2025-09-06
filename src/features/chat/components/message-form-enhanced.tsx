import { useState, useRef, useEffect } from 'react';

import {
  ChevronDownIcon,
  PaperclipIcon,
  SendHorizonal,
  SquareStopIcon,
} from 'lucide-react';

import { Button } from '@components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Separator } from '@components/ui/separator';
import { Textarea } from '@components/ui/textarea';

import { AI_MODELS } from '@features/chat-old/constants/ai-models';

import { useChatsStore } from '../stores/chats.store';

import MessageReply from './form/message-reply';

import type { AIModel } from '../types';

type Props = {
  chatId: string;
};

const MessageFormEnhanced = ({ chatId }: Props) => {
  const [content, setContent] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>(
    AI_MODELS.GEMINI_2_0_FLASH_LITE
  );
  const [replyInfo, setReplyInfo] = useState<{ id: string; content: string } | null>(
    null
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatState = useChatsStore(state => state.chats[chatId]);
  const sendMessage = useChatsStore(state => state.sendMessage);
  const stopStreaming = useChatsStore(state => state.stopStreaming);

  const isStreaming = chatState?.isStreaming || false;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isStreaming) return;

    const messageContent = content.trim();
    setContent('');
    setReplyInfo(null);

    await sendMessage(chatId, messageContent, selectedModel);

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
    stopStreaming(chatId);
  };

  const handleCloseReply = () => {
    setReplyInfo(null);
  };

  return (
    <div>
      {replyInfo && (
        <MessageReply
          content={replyInfo.content}
          className="mx-4 shadow-md"
          onClose={handleCloseReply}
        />
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-background-accent outline-input flex items-center gap-2 rounded-lg
          p-2 pl-2.5 shadow-sm outline-1"
      >
        <Select
          value={selectedModel}
          onValueChange={value => {
            setSelectedModel(value as AIModel);
            setTimeout(() => {
              textareaRef?.current?.focus();
            }, 50);
          }}
          disabled={isStreaming}
        >
          <SelectTrigger
            size="sm"
            className="my-0.5 gap-0 self-end p-0"
          >
            <div className="px-3">
              <SelectValue />
            </div>
            <Separator orientation="vertical" />
            <div className="flex items-center justify-center px-1">
              <ChevronDownIcon className="size-4" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={AI_MODELS.GEMINI_2_0_FLASH_LITE}>
              {AI_MODELS.GEMINI_2_0_FLASH_LITE.toUpperCase()}
            </SelectItem>
            <SelectItem value={AI_MODELS.GEMINI_2_0_FLASH}>
              {AI_MODELS.GEMINI_2_0_FLASH.toUpperCase()}
            </SelectItem>
            <SelectItem value={AI_MODELS.GEMINI_2_5_FLASH}>
              {AI_MODELS.GEMINI_2_5_FLASH.toUpperCase()}
            </SelectItem>
            <SelectItem value={AI_MODELS.GEMINI_2_5_PRO}>
              {AI_MODELS.GEMINI_2_5_PRO.toUpperCase()}
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="secondary"
          className="my-0.5 size-8 self-end"
          disabled={isStreaming}
        >
          <PaperclipIcon className="text-secondary-foreground" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          autoComplete="off"
          disabled={isStreaming}
          className="bg-background-accent flex max-h-[600px] resize-none items-center
            overflow-y-auto border-none px-0 shadow-none focus-visible:ring-0"
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

export default MessageFormEnhanced;
