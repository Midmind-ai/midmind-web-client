import {
  ChevronDownIcon,
  PaperclipIcon,
  SendHorizonal,
  SquareStopIcon,
} from 'lucide-react';
import { Controller } from 'react-hook-form';

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

import { useChatMessageFormLogic } from '@features/chat/components/chat-message-form/use-chat-message-form-logic';
import MessageReply from '@features/chat/components/message-reply/message-reply';
import { AI_MODELS } from '@features/chat/constants/ai-models';
import type { OnSubmitArgs } from '@features/chat/types/chat-types';

import type { ConversationWithAIRequestDto } from '@services/conversations/conversations-dtos';

type Props = {
  chatId?: string;
  onSubmit?: (data: OnSubmitArgs) => void;
  branchContext?: ConversationWithAIRequestDto['branch_context'];
};

const ChatMessageForm = ({ chatId, onSubmit, branchContext }: Props) => {
  const {
    isValid,
    replyInfo,
    control,
    hasActiveRequest,
    register,
    handleSubmit,
    handleFormSubmit,
    abortCurrentRequest,
    handleKeyDown,
    handleCloseReply,
  } = useChatMessageFormLogic({ chatId, onSubmit, branchContext });

  return (
    <div>
      {replyInfo?.id && (
        <MessageReply
          content={replyInfo.content}
          className="mx-4 shadow-md"
          onClose={handleCloseReply}
        />
      )}
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="outline-input bg-background-accent flex items-center gap-2 rounded-lg
          p-2 pl-2.5 shadow-sm outline-1"
      >
        <Controller
          name="model"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={hasActiveRequest}
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
          )}
        />
        <Button
          type="button"
          variant="secondary"
          className="my-0.5 size-8 self-end"
          disabled={hasActiveRequest}
        >
          <PaperclipIcon className="text-secondary-foreground" />
        </Button>
        <Textarea
          {...register('content')}
          autoComplete="off"
          placeholder="Write a message..."
          className="bg-background-accent! flex max-h-[600px] resize-none items-center
            overflow-y-auto border-none px-0 shadow-none focus-visible:ring-0"
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
            <SquareStopIcon className="text-background size-4" />
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
    </div>
  );
};

export default ChatMessageForm;
