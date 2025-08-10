import { Link } from 'react-router';

import {
  BreadcrumbItem as ShadcnBreadcrumbItem,
  BreadcrumbLink,
} from '@shared/components/ui/breadcrumb';

import { type EntityType } from '@shared/types/entity';

import { cn } from '@shared/utils/cn';
import { renderEntityIcon } from '@shared/utils/entity-icons';

type Props = {
  title: string;
  type: EntityType;
  isActive?: boolean;
  href: string;
};

const BreadcrumbItem = ({ title, type, isActive, href }: Props) => {
  return (
    <ShadcnBreadcrumbItem>
      <BreadcrumbLink
        className="group hover:bg-sidebar-accent hover:text-foreground flex cursor-pointer
          items-center gap-1.5 rounded-sm px-2 py-1"
        asChild
      >
        <Link
          className={cn(
            isActive && 'text-foreground',
            'group-hover:text-primary transition-none'
          )}
          to={href}
        >
          {renderEntityIcon(type)}
          {title}
        </Link>
      </BreadcrumbLink>
    </ShadcnBreadcrumbItem>
  );
};

export default BreadcrumbItem;
