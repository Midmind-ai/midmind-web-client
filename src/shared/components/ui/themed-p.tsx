import type { FC, HTMLAttributes } from 'react';

import { cn } from '@shared/utils/cn';

const ThemedP: FC<HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p
      className={cn('text-foreground', className)}
      {...props}
    >
      {children}
    </p>
  );
};

export { ThemedP };
