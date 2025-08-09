import { ChevronDownIcon, CircleStop, PaperclipIcon, SendHorizonal } from 'lucide-react';

import { Button } from '@shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import { Separator } from '@shared/components/ui/separator';
import { Textarea } from '@shared/components/ui/textarea';

import type { ConversationWithAIRequestDto } from '@shared/services/conversations/conversations-dtos';

import { useChatMessageFormLogic } from '@features/chat/components/chat-message-form/use-chat-message-form-logic';
import type { OnSubmitArgs } from '@features/chat/types/chat-types';

type Props = {
  chatId?: string;
  onSubmit?: (data: OnSubmitArgs) => void;
  threadContext?: ConversationWithAIRequestDto['thread_context'];
};

const ChatMessageForm = ({ chatId, onSubmit, threadContext }: Props) => {
  const {
    currentModel,
    isValid,
    hasActiveRequest,
    register,
    handleSubmit,
    handleFormSubmit,
    handleModelChange,
    abortCurrentRequest,
    handleKeyDown,
  } = useChatMessageFormLogic({ chatId, onSubmit, threadContext });

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="outline-input flex items-center gap-2 rounded-lg px-2.5 py-2 outline-1"
    >
      <Select
        value={currentModel}
        onValueChange={handleModelChange}
        disabled={hasActiveRequest}
      >
        <SelectTrigger
          size="sm"
          className="gap-0 self-end p-0"
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
          <SelectItem value="gemini-2.0-flash-lite">2.0-FLASH-LIGHT</SelectItem>
          <SelectItem value="gemini-2.0-flash">2.0-FLASH</SelectItem>
          <SelectItem value="gemini-2.5-flash">2.5-FLASH</SelectItem>
          <SelectItem value="gemini-2.5-pro">2.5-PRO</SelectItem>
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="secondary"
        className="size-8 self-end"
        disabled={hasActiveRequest}
      >
        <PaperclipIcon className="text-secondary-foreground" />
      </Button>
      <Textarea
        {...register('content')}
        autoComplete="off"
        placeholder="Write a message..."
        className="flex max-h-28 resize-none items-center overflow-y-auto border-none px-0
          shadow-none focus-visible:ring-0"
        disabled={hasActiveRequest}
        autoFocus
        onKeyDown={handleKeyDown}
      />
      {hasActiveRequest ? (
        <Button
          type="button"
          className="size-9 self-end"
          onClick={abortCurrentRequest}
        >
          <CircleStop className="text-background size-4" />
        </Button>
      ) : (
        <Button
          type="submit"
          className="size-9 self-end"
          disabled={!isValid || hasActiveRequest}
        >
          <SendHorizonal className="text-background size-4" />
        </Button>
      )}
    </form>
  );
};

export default ChatMessageForm;
