import { useState, useRef, useEffect } from 'react';

import { Button } from '@components/ui/button';
import { Textarea } from '@components/ui/textarea';

import { useChatsStore } from '../stores/chats.store';

type Props = {
  chatId: string;
};

const MessageForm = ({ chatId }: Props) => {
  const [content, setContent] = useState('');
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

    await sendMessage(chatId, messageContent);

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

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2"
    >
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isStreaming ? 'AI is responding...' : 'Type your message...'}
        disabled={isStreaming}
        className="min-h-[60px] flex-1 resize-none"
        rows={2}
      />

      {isStreaming ? (
        <Button
          type="button"
          onClick={handleStop}
          variant="destructive"
          className="self-end"
        >
          Stop
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={!content.trim()}
          className="self-end"
        >
          Send
        </Button>
      )}
    </form>
  );
};

export default MessageForm;
