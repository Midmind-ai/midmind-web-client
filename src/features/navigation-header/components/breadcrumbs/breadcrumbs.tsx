import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@shared/components/ui/breadcrumb';

import { EntityEnum } from '@shared/types/entity';

import BreadcrumbItem from '@features/navigation-header/components/breadcrumb-item/breadcrumb-item';

const Breadcrumbs = () => {
  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-1 sm:gap-1">
        <BreadcrumbItem
          title="Workspace"
          type={EntityEnum.Workspace}
          href="/"
        />
        <BreadcrumbSeparator />
        <BreadcrumbItem
          title="Folder"
          type={EntityEnum.Folder}
          href="/"
        />
        <BreadcrumbSeparator />
        <BreadcrumbItem
          title="Mindlet"
          type={EntityEnum.Mindlet}
          href="/"
        />
        <BreadcrumbSeparator />
        <BreadcrumbItem
          title="Root chat"
          type={EntityEnum.RootChat}
          href="/"
        />

        <BreadcrumbSeparator />
        <BreadcrumbItem
          title="Chat"
          type={EntityEnum.Chat}
          href="/"
        />
        <BreadcrumbSeparator />
        <BreadcrumbItem
          title="Branch"
          type={EntityEnum.BranchChat}
          href="/"
        />
        <BreadcrumbSeparator />
        <BreadcrumbItem
          title="Note"
          type={EntityEnum.Note}
          href="/"
        />
        <BreadcrumbSeparator />
        <BreadcrumbItem
          title="Prompt"
          type={EntityEnum.Prompt}
          href="/"
        />
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
