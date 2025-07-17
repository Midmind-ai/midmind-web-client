import type { FC, HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

const ThemedH2: FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => {
  return (
    <h2
      className={cn('text-foreground', className)}
      {...props}
    >
      {children}
    </h2>
  );
};

export { ThemedH2 };
