import { Link } from 'react-router';

import {
  BreadcrumbItem as ShadcnBreadcrumbItem,
  BreadcrumbLink,
} from '@components/ui/breadcrumb';
import { ThemedSpan } from '@components/ui/themed-span';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip';

import { useTextTruncation } from '@hooks/utils/use-is-text-truncated';

import { type EntityType } from '@shared-types/entity';

import { cn } from '@utils/cn';
import { renderEntityIcon } from '@utils/entity-icons';

type Props = {
  title: string;
  type: EntityType;
  isActive?: boolean;
  href: string;
};

const BreadcrumbItem = ({ title, type, isActive, href }: Props) => {
  const { textRef, isTruncated } = useTextTruncation(title);

  const breadcrumbContent = (
    <div className="flex min-w-0 items-center gap-1.5">
      <div className="flex-shrink-0">{renderEntityIcon(type)}</div>
      <ThemedSpan
        ref={textRef}
        className="truncate"
      >
        {title}
      </ThemedSpan>
    </div>
  );

  return (
    <ShadcnBreadcrumbItem>
      <BreadcrumbLink
        className="group hover:bg-sidebar-accent hover:text-foreground flex max-w-[300px]
          cursor-pointer items-center gap-1.5 rounded-sm px-2 py-1"
        asChild
      >
        <Link
          className={cn(
            isActive && 'text-foreground',
            'group-hover:text-primary transition-none'
          )}
          to={href}
        >
          {isTruncated ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>{breadcrumbContent}</TooltipTrigger>
                <TooltipContent>
                  <p>{title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            breadcrumbContent
          )}
        </Link>
      </BreadcrumbLink>
    </ShadcnBreadcrumbItem>
  );
};

export default BreadcrumbItem;
