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

import { SUPPORTED_FORMATS } from '@constants/files';

import GlobalFileDropZone from '@features/chat/components/global-file-drop-zone/global-file-drop-zone';
import ImageUploadProgress from '@features/chat/components/image-upload-progress/image-upload-progress';
import MessageReply from '@features/chat/components/message-reply/message-reply';
import { AI_MODELS } from '@features/chat/constants/ai-models';
import type { OnSubmitArgs } from '@features/chat/types/chat-types';

import type { ConversationWithAIRequestDto } from '@services/conversations/conversations-dtos';

import { useChatMessageFormLogic } from './use-chat-message-form-logic';

type Props = {
  chatId?: string;
  onSubmit?: (data: OnSubmitArgs) => void;
  branchContext?: ConversationWithAIRequestDto['branch_context'];
};

const ChatMessageForm = ({ chatId, onSubmit, branchContext }: Props) => {
  const {
    isValid,
    replyInfo,
    selectedImages,
    control,
    hasActiveRequest,
    fileInputRef,
    handleImageButtonClick,
    register,
    handleSubmit,
    handleSubmitForm,
    abortCurrentRequest,
    handleKeyDown,
    handleReplyClose,
    handleImageUpload,
    handleImageRemove,
    handleOpenFileViewModal,
    handleImagePaste,
  } = useChatMessageFormLogic({ chatId, onSubmit, branchContext });

  return (
    <div>
      {replyInfo?.id && (
        <MessageReply
          content={replyInfo.content}
          className="mx-4 shadow-md"
          onClose={handleReplyClose}
        />
      )}
      <GlobalFileDropZone
        onFilesSelected={handleImageUpload}
        disabled={hasActiveRequest}
      >
        <form
          onSubmit={handleSubmit(handleSubmitForm)}
          className="outline-input bg-background-accent flex flex-col gap-2 rounded-lg p-2
            pl-2.5 shadow-sm outline-1"
        >
          {selectedImages.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {selectedImages.map((image, index) => (
                <ImageUploadProgress
                  key={`${image.name}-${index}`}
                  file={image}
                  progress={0}
                  onRemove={() => handleImageRemove(index)}
                  onView={() => handleOpenFileViewModal(image)}
                />
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={SUPPORTED_FORMATS.join(',')}
              onChange={e => handleImageUpload(e.target.files)}
              className="hidden"
            />
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
              onClick={handleImageButtonClick}
              aria-label="Upload images"
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
              onPaste={handleImagePaste}
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
          </div>
        </form>
      </GlobalFileDropZone>
    </div>
  );
};

export default ChatMessageForm;
