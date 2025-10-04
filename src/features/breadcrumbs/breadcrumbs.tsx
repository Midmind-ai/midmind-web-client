import { memo } from 'react';
import type { BreadcrumbItem as BreadcrumbItemType } from '../../services/items/items-dtos';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@components/ui/breadcrumb';
import { AppRoutes } from '@constants/paths';
import BreadcrumbItem from '@features/breadcrumbs/components/breadcrumb-item/breadcrumb-item';
import { useGetItemBreadcrumbs } from '@features/breadcrumbs/hooks/use-get-item-breadcrumbs';

type Props = {
  id: string;
};

const Breadcrumbs = ({ id }: Props) => {
  const { data } = useGetItemBreadcrumbs(id);

  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-1 sm:gap-1">
        {data?.breadcrumbs?.map(
          ({ id, name, type }: BreadcrumbItemType, index: number) => (
            <div
              className="flex items-center gap-1"
              key={id}
            >
              <BreadcrumbItem
                title={name}
                type={type}
                href={AppRoutes.Item(id)}
              />
              {index < data.breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </div>
          )
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default memo(Breadcrumbs);
