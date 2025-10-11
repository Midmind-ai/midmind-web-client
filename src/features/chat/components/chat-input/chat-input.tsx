import { PaperclipIcon, SendHorizonal, SquareStopIcon } from 'lucide-react';
import { useState, useRef, useEffect, memo } from 'react';
import MessageReply from './message-reply';
import ModelSelector from './model-selector';
import { Button } from '@components/ui/button';
import { Textarea } from '@components/ui/textarea';
import GlobalFileDropZone from '@features/chat/components/global-file-drop-zone/global-file-drop-zone';
import ImageUploadProgress from '@features/chat/components/image-upload-progress/image-upload-progress';
import { useDraftAutoSave } from '@features/chat/hooks/use-draft-autosave';
import { useDraftMessageLoader } from '@features/chat/hooks/use-draft-message-loader';
import { useFileUpload } from '@features/chat/hooks/use-file-upload';
import { useChatsStore } from '@features/chat/stores/chats.store';
import type { AIModel, ChatMessage } from '@shared-types/entities';
import { useAiModelStore } from '@stores/ai-model.store';

type Props = {
  chatId?: string;
  onSubmit?: (
    content: string,
    model: AIModel,
    attachments?: ChatMessage['attachments'],
    attachmentFiles?: File[]
  ) => Promise<void>;
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

  // Custom hooks
  const {
    attachments,
    setAttachments,
    fileInputRef,
    handleFileUpload,
    handleFileRemove,
    handleFilePaste,
    handleFileButtonClick,
    handleFileClick,
    supportedFormats,
  } = useFileUpload();

  useDraftMessageLoader({
    chatId,
    chatState,
    onContentChange: setContent,
    onAttachmentsChange: setAttachments,
  });

  useDraftAutoSave({
    chatId,
    content,
    attachments,
    replyContext,
    isStreaming,
    debounceMs: 1500,
  });

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

    const hasContent = !!content.trim();
    const hasAttachments = attachments.length > 0;

    if ((!hasContent && !hasAttachments) || isStreaming || disabled) return;

    const messageContent = content.trim();
    const attachmentData = attachments
      .filter(attachment => attachment.id)
      .map(attachment => ({
        id: attachment.id,
        mime_type: attachment.file.type,
        original_filename: attachment.file.name,
      }));

    const attachmentFiles = attachments
      .filter(attachment => attachment.id)
      .map(attachment => attachment.file);

    setContent('');
    setAttachments([]);

    try {
      if (onSubmit) {
        // Use custom onSubmit handler
        await onSubmit(messageContent, currentModel, attachmentData, attachmentFiles);

        // Clear reply context if using custom handler
        if (chatId && replyContext) {
          setReplyContext(chatId, null);
        }
      } else if (chatId) {
        await sendMessage(
          chatId,
          messageContent,
          currentModel,
          attachmentData,
          attachmentFiles
        );
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
    <GlobalFileDropZone
      onFilesSelected={handleFileUpload}
      disabled={isStreaming || disabled}
    >
      {replyContext && (
        <MessageReply
          content={replyContext.content}
          className="mx-2 shadow-md"
          onClose={handleCloseReply}
        />
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-background-accent outline-input flex flex-col gap-2 rounded-lg p-2
          pl-2.5 shadow-sm outline-1 @max-[840px]:rounded-none"
      >
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            {attachments.map((attachment, index) => {
              return (
                <ImageUploadProgress
                  key={`${attachment.file.name}-${index}`}
                  file={attachment.file}
                  progress={attachment.progress}
                  isUploading={!attachment.id}
                  onRemove={() => handleFileRemove(index)}
                  onClick={() => handleFileClick(attachment.file)}
                />
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-2">
          <ModelSelector
            disabled={isStreaming || disabled}
            onModelChange={() => {
              setTimeout(() => {
                textareaRef?.current?.focus();
              }, 50);
            }}
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={supportedFormats.join(',')}
            onChange={e => handleFileUpload(e.target.files)}
            className="hidden"
          />

          <Button
            type="button"
            variant="secondary"
            className="my-0.5 size-8 self-end"
            disabled={isStreaming || disabled}
            onClick={handleFileButtonClick}
          >
            <PaperclipIcon className="text-secondary-foreground" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handleFilePaste}
            placeholder={placeholder}
            autoComplete="off"
            disabled={isStreaming || disabled}
            className="bg-background-accent! flex max-h-[600px] resize-none items-center
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
              disabled={!content.trim() && !attachments.length}
            >
              <SendHorizonal className="text-background size-4" />
            </Button>
          )}
        </div>
      </form>
    </GlobalFileDropZone>
  );
};

export default memo(ChatInput);
