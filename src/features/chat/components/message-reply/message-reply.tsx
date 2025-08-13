import { Reply, X } from 'lucide-react';

import { Button } from '@components/ui/button';
import { ThemedP } from '@components/ui/themed-p';

import { cn } from '@utils/cn';

type Props = {
  content: string;
  className?: string;
  placement?: 'chat-message-form' | 'message';
  onClose?: VoidFunction;
};

const MessageReply = ({
  content,
  className,
  placement = 'chat-message-form',
  onClose,
}: Props) => {
  const placedInMessage = placement === 'message';

  const classNames = cn(
    'flex gap-1.5 p-2.5 rounded-tl-[10px] rounded-tr-[10px]',
    !placedInMessage && 'bg-accent border-base border',
    placedInMessage && 'bg-background-accent',
    className
  );

  return (
    <div className={classNames}>
      <Reply className="size-5 flex-shrink-0" />
      <ThemedP className="line-clamp-2 flex-1 overflow-hidden text-sm font-light">
        {content}
      </ThemedP>
      {!placedInMessage && onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0"
          onClick={onClose}
        >
          <X className="size-5" />
        </Button>
      )}
    </div>
  );
};

export default MessageReply;
