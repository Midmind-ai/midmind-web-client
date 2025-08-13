import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

const ThemedSpan = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('text-foreground', className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

ThemedSpan.displayName = 'ThemedSpan';

export { ThemedSpan };
