import { Reply } from 'lucide-react';

import { ThemedP } from '@/shared/components/ui/themed-p';
import { cn } from '@/shared/utils/cn';

type Props = {
  content: string;
  className?: string;
  placement?: 'chat-message-form' | 'message';
};

const MessageReply = ({ content, className, placement = 'chat-message-form' }: Props) => {
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
      <ThemedP className="line-clamp-2 overflow-hidden text-sm font-light">
        {content}
      </ThemedP>
    </div>
  );
};

export default MessageReply;
