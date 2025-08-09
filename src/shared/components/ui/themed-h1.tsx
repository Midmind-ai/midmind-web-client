import type { FC, HTMLAttributes } from 'react';

import { cn } from '@shared/utils/cn';

const ThemedH1: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h1
      className={cn('text-foreground', className)}
      {...props}
    >
      {children}
    </h1>
  );
};

export { ThemedH1 };
