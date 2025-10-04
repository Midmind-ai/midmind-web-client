import { Link } from 'react-router';
import type { ItemTypeEnum } from '../../../../services/items/items-dtos';
import NodeIcon from '../../../file-system/components/tree-node/components/node-icon';
import {
  BreadcrumbItem as ShadcnBreadcrumbItem,
  BreadcrumbLink,
} from '@components/ui/breadcrumb';
import { ThemedSpan } from '@components/ui/themed-span';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip';
import { useIsTextTruncated } from '@hooks/utils/use-is-text-truncated';
import { cn } from '@utils/cn';

type Props = {
  title: string;
  type: ItemTypeEnum;
  isActive?: boolean;
  href: string;
};

const BreadcrumbItem = ({ title, type, isActive, href }: Props) => {
  const { textRef, isTruncated } = useIsTextTruncated(title);

  const breadcrumbContent = (
    <div className="flex min-w-0 items-center gap-1.5">
      <div className="flex-shrink-0">
        <NodeIcon nodeType={type} />
      </div>
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
      {isTruncated ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <BreadcrumbLink
              className="group hover:bg-sidebar-accent hover:text-foreground flex
                max-w-[250px] cursor-pointer items-center gap-1.5 rounded-sm px-2 py-1"
              asChild
            >
              <Link
                className={cn(
                  isActive && 'text-foreground',
                  'group-hover:text-primary transition-none'
                )}
                to={href}
              >
                {breadcrumbContent}
              </Link>
            </BreadcrumbLink>
          </TooltipTrigger>
          <TooltipContent>
            <p>{title}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <BreadcrumbLink
          className="group hover:bg-sidebar-accent hover:text-foreground flex
            max-w-[250px] cursor-pointer items-center gap-1.5 rounded-sm px-2 py-1"
          asChild
        >
          <Link
            className={cn(
              isActive && 'text-foreground',
              'group-hover:text-primary transition-none'
            )}
            to={href}
          >
            {breadcrumbContent}
          </Link>
        </BreadcrumbLink>
      )}
    </ShadcnBreadcrumbItem>
  );
};

export default BreadcrumbItem;
