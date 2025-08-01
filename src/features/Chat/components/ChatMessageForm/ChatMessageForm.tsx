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

const ChatMessageForm = () => {
  const {
    register,
    handleSubmit,
    handleFormSubmit,
    handleModelChange,
    currentModel,
    isValid,
    isLoading,
  } = useChatMessageFormLogic();

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
            <SelectItem value="gemini-2.0-flash">2.0-FLASH</SelectItem>
            <SelectItem value="gemini-2.0-flash-lite">2.0-FLASH-LIGHT</SelectItem>
            <SelectItem value="gemini-2.5-flash">2.5-FLASH</SelectItem>
            <SelectItem value="gemini-2.5-pro">2.5-PRO</SelectItem>
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
            {...register('content')}
            autoComplete="off"
            className="border-0 shadow-none p-0 focus-visible:ring-0"
            placeholder="Write a message..."
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !isValid}
          className="size-9"
        >
          <MicIcon />
        </Button>
      </form>
    </>
  );
};

export default ChatMessageForm;
