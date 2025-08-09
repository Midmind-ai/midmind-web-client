import { X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

import { Button } from '@shared/components/ui/button';
import { ThemedH2 } from '@shared/components/ui/themed-h2';

import { SearchParams } from '@shared/constants/router';

type Props = {
  showCloseButton?: boolean;
};

const ChatHeader = ({ showCloseButton = false }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCloseSplit = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete(SearchParams.Split);

    navigate(`${location.pathname}${currentUrl.search}`);
  };

  return (
    <div className="flex items-center justify-between border-b-1 p-2">
      <ThemedH2 className="text-lg font-semibold">Chat header</ThemedH2>
      {showCloseButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCloseSplit}
          className="hover:bg-muted h-6 w-6 p-0"
          aria-label="Close split view"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ChatHeader;
