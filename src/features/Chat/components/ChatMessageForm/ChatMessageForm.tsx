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

import { Button } from '@/shared/components/Button';

const ChatMessageForm = () => {
  return (
    <>
      <Separator />
      <div className="flex items-center w-full p-2 gap-2">
        <Select defaultValue="gpt-4o">
          <SelectTrigger className="h-8 p-0 gap-0">
            <div className="px-2">
              <SelectValue />
            </div>
            <Separator orientation="vertical" />
            <div className="flex items-center justify-center px-2">
              <ChevronDownIcon className="size-4" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
            <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
            <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
            <SelectItem value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</SelectItem>
          </SelectContent>
        </Select>
        <Button className="size-8 bg-secondary hover:bg-secondary">
          <PaperclipIcon className="text-secondary-foreground" />
        </Button>
        <div className="flex-1">
          <Input
            className="border-0 shadow-none p-0 focus-visible:ring-0"
            placeholder="Write a message..."
          />
        </div>
        <Button className="size-9">
          <MicIcon />
        </Button>
      </div>
    </>
  );
};

export default ChatMessageForm;
