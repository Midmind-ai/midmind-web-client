import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { TooltipContent, TooltipTrigger } from '@components/ui/tooltip';

type Props = {
  content: string;
  children: React.ReactNode;
  disabled?: boolean;
};

const TooltipWrapper = ({ content, children }: Props) => {
  return (
    <TooltipPrimitive.Root open={false}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={8}
      >
        {content}
      </TooltipContent>
    </TooltipPrimitive.Root>
  );
};

export default TooltipWrapper;
