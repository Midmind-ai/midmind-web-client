import { ChevronDownIcon, MicIcon, PaperclipIcon } from 'lucide-react';

import { Input } from '@shared/components/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/Select';
import { Separator } from '@shared/components/Separator';

import { useChatMessageFormLogic } from '@/features/Chat/components/ChatMessageForm/useChatMessageFormLogic';
import { Button } from '@/shared/components/Button';
import { LLModels } from '@/shared/constants/api';

const ChatMessageForm = () => {
  const { register, handleSubmit, handleFormSubmit, handleModelChange, currentModel, isLoading } =
    useChatMessageFormLogic();

  return (
    <>
      <Separator />
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex items-center w-full p-2 gap-2"
      >
        <Select
          value={currentModel}
          onValueChange={handleModelChange}
        >
          <SelectTrigger
            size="sm"
            className="p-0 gap-0"
          >
            <div className="px-2">
              <SelectValue />
            </div>
            <Separator orientation="vertical" />
            <div className="flex items-center justify-center px-2">
              <ChevronDownIcon className="size-4" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LLModels.Gemini20Flash}>2.0-FLASH</SelectItem>
            <SelectItem value={LLModels.Gemini20FlashLite}>2.0-FLASH-LIGHT</SelectItem>
            <SelectItem value={LLModels.Gemini25Flash}>2.5-FLASH</SelectItem>
            <SelectItem value={LLModels.Gemini25Pro}>2.5-PRO</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="secondary"
          className="size-8"
        >
          <PaperclipIcon className="text-secondary-foreground" />
        </Button>
        <div className="flex-1">
          <Input
            {...register('message')}
            autoComplete="off"
            className="border-0 shadow-none p-0 focus-visible:ring-0"
            placeholder="Write a message..."
          />
        </div>
        <Button
          disabled={isLoading}
          className="size-9"
        >
          <MicIcon />
        </Button>
      </form>
    </>
  );
};

export default ChatMessageForm;
