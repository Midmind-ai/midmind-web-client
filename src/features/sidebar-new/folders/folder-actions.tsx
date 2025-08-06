import { FilePlus2, FileSearch2, FolderPlus, MessageSquarePlus, PackagePlus } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Button } from '@/shared/components/Button';
import { AppRoutes } from '@/shared/constants/router';

export default function FolderActions() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between border-b-1 p-1">
      <div>
        <Button
          variant={'ghost'}
          size={'icon'}
          className="size-8 rounded-sm"
        >
          <FileSearch2 className="size-5.5! stroke-1" />
        </Button>
      </div>
      <div className="flex gap-1">
        <Button
          variant={'ghost'}
          size={'icon'}
          className="size-8 rounded-sm"
        >
          <FilePlus2 className="size-5.5! stroke-1" />
        </Button>
        <Button
          variant={'ghost'}
          size={'icon'}
          className="size-8 rounded-sm"
        >
          <FolderPlus className="size-5.5! stroke-1" />
        </Button>
        <Button
          variant={'ghost'}
          size={'icon'}
          className="size-8 rounded-sm"
          onClick={() => navigate(`${AppRoutes.Home}`)}
        >
          <MessageSquarePlus className="size-5.5! stroke-1" />
        </Button>
        <Button
          variant={'ghost'}
          size={'icon'}
          className="size-8 rounded-sm"
        >
          <PackagePlus
            className="size-5.5! stroke-1"
            color="oklch(62.7% 0.194 149.214)"
          />
        </Button>
      </div>
    </div>
  );
}
