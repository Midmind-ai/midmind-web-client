import { Reply, X } from 'lucide-react';
import { Button } from '@components/ui/button';
import { ThemedP } from '@components/ui/themed-p';
import { cn } from '@utils/cn';

type Props = {
  content: string;
  className?: string;
  placement?: 'message' | 'form';
  onClose?: VoidFunction;
};

const MessageReply = ({ content, className, placement = 'form', onClose }: Props) => {
  const placedInMessage = placement === 'message';

  const classNames = cn(
    'flex gap-2 p-2.5 rounded-tl-[10px] rounded-tr-[10px]',
    !placedInMessage && 'bg-accent border-base border-t border-r border-l',
    placedInMessage && 'bg-background-accent',
    placement === 'message' && 'mb-0',
    placement === 'form' && 'mb-0',
    className
  );

  return (
    <div className={classNames}>
      <Reply className="flex-shrink-1.5 size-5 stroke-1" />
      <ThemedP className="line-clamp-2 flex-1 overflow-hidden text-base font-light">
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
