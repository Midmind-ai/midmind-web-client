import type { FC, HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

const ThemedSpan: FC<HTMLAttributes<HTMLSpanElement>> = ({ className, children, ...props }) => {
  return (
    <span
      className={cn('text-foreground', className)}
      {...props}
    >
      {children}
    </span>
  );
};

export { ThemedSpan };
