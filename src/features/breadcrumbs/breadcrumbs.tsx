import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@components/ui/breadcrumb';

import { AppRoutes } from '@constants/paths';

import BreadcrumbItem from '@features/breadcrumbs/components/breadcrumb-item/breadcrumb-item';
import { useGetChatBreadcrumbs } from '@features/breadcrumbs/hooks/use-get-chat-breadcrumbs';

type Props = {
  id: string;
};

const Breadcrumbs = ({ id }: Props) => {
  const { data } = useGetChatBreadcrumbs(id);

  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-1 sm:gap-1">
        {data?.map(({ id, name, type }, index) => (
          <>
            <BreadcrumbItem
              key={id}
              title={name}
              type={type}
              href={AppRoutes.Chat(id)}
            />
            {index < data.length - 1 && <BreadcrumbSeparator />}
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
