import { X } from 'lucide-react';

import { Button } from '@components/ui/button';

import { cn } from '@utils/cn';

type Props = {
  content: string;
  className?: string;
  placement?: 'message' | 'form';
  onClose?: VoidFunction;
};

const MessageReply = ({ content, className, placement = 'form', onClose }: Props) => {
  return (
    <div
      className={cn(
        `relative rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3
        dark:border-blue-400 dark:bg-blue-900/20`,
        placement === 'message' && 'mb-2',
        placement === 'form' && 'mb-3',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Replying to:
          </p>
          <p className="mt-1 truncate text-sm text-gray-800 dark:text-gray-200">
            {content}
          </p>
        </div>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-2 h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MessageReply;
