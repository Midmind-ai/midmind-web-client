import { ChevronDownIcon, CircleStop, PaperclipIcon, SendHorizonal } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/Select';
import { Separator } from '@shared/components/Separator';
import { Textarea } from '@shared/components/Textarea';

import { useChatMessageFormLogic } from '@/features/Chat/components/ChatMessageForm/useChatMessageFormLogic';
import type { OnSubmitArgs } from '@/features/Chat/types/chatTypes';
import { Button } from '@/shared/components/Button';

type Props = {
  onSubmit?: (data: OnSubmitArgs) => void;
};

const ChatMessageForm = ({ onSubmit }: Props) => {
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
  } = useChatMessageFormLogic(onSubmit);

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex items-center gap-2 outline-1 outline-input px-2.5 py-2 rounded-lg"
    >
      <Select
        value={currentModel}
        onValueChange={handleModelChange}
        disabled={hasActiveRequest}
      >
        <SelectTrigger
          size="sm"
          className="p-0 gap-0 self-end"
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
          <SelectItem value="gemini-2.0-flash">2.0-FLASH</SelectItem>
          <SelectItem value="gemini-2.0-flash-lite">2.0-FLASH-LIGHT</SelectItem>
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
        className="border-none shadow-none px-0 flex items-center focus-visible:ring-0 max-h-28 resize-none overflow-y-auto"
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
          <CircleStop className="size-4 text-background" />
        </Button>
      ) : (
        <Button
          type="submit"
          className="size-9 self-end"
          disabled={!isValid || hasActiveRequest}
        >
          <SendHorizonal className="size-4 text-background" />
        </Button>
      )}
    </form>
  );
};

export default ChatMessageForm;
