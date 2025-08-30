import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@components/ui/breadcrumb';

import { AppRoutes } from '@constants/paths';

import BreadcrumbItem from '@features/breadcrumbs/components/breadcrumb-item/breadcrumb-item';
import { useGetChatBreadcrumbs } from '@features/breadcrumbs/hooks/use-get-chat-breadcrumbs';

import type { GetChatBreadcrumbsResponseDto } from '@services/breadcrumbs/breadcrumbs-dtos';

type Props = {
  id: string;
};

const Breadcrumbs = ({ id }: Props) => {
  const { data } = useGetChatBreadcrumbs(id);

  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-1 sm:gap-1">
        {data?.map(
          ({ id, name, type }: GetChatBreadcrumbsResponseDto[0], index: number) => (
            <div
              className="flex items-center"
              key={id}
            >
              <BreadcrumbItem
                title={name}
                type={type}
                href={AppRoutes.Chat(id)}
              />
              {index < data.length - 1 && <BreadcrumbSeparator />}
            </div>
          )
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
