import type { FC, HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

const ThemedH3: FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => {
  return (
    <h3
      className={cn('text-foreground', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export { ThemedH3 };
