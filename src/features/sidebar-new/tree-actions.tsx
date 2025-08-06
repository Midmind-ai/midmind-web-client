import { MessageSquarePlus } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Button } from '@/shared/components/Button';
import { AppRoutes } from '@/shared/constants/router';

export default function TreeActions() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between border-b-1 p-1">
      <div></div>
      <div className="flex gap-2">
        <Button
          variant={'ghost'}
          size={'sm'}
          className="rounded-sm"
          onClick={() => navigate(`${AppRoutes.Home}`)}
        >
          <MessageSquarePlus />
        </Button>
      </div>
    </div>
  );
}
