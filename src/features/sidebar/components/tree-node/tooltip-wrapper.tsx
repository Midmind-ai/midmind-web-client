import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/components/ui/tooltip';

import { TOOLTIP_DELAY } from './constants';

type Props = {
  content: string;
  children: React.ReactNode;
  disabled?: boolean;
};

const TooltipWrapper = ({ content, children }: Props) => {
  return (
    <TooltipProvider delayDuration={TOOLTIP_DELAY}>
      <TooltipPrimitive.Root open={false}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={8}
        >
          {content}
        </TooltipContent>
      </TooltipPrimitive.Root>
    </TooltipProvider>
  );
};

export default TooltipWrapper;
