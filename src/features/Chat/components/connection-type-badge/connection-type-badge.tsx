import { GitMerge } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@shared/components/ui/button';
import { ThemedSpan } from '@shared/components/ui/themed-span';

import { AppRoutes, SearchParams } from '@shared/constants/router';

import { cn } from '@shared/utils/cn';
import { darkenColor } from '@shared/utils/colors';

type Props = {
  connectionType: string;
  bgColor: string;
  threadChatId: string;
};

const CONNECTION_LABELS = {
  attached: 'Detach',
  detached: 'Attach',
};

const ConnectionTypeBadge = ({ bgColor, connectionType, threadChatId }: Props) => {
  const isDetached = connectionType === 'detached';
  const label = CONNECTION_LABELS[connectionType as keyof typeof CONNECTION_LABELS];

  const containerStyles = isDetached ? { borderColor: bgColor } : { backgroundColor: bgColor };
  const iconColor = isDetached ? bgColor : 'white';
  const buttonStyles = { color: bgColor };
  const labelStyles = { color: darkenColor(bgColor) };

  const handleClick = () => {
    // eslint-disable-next-line no-alert
    alert('Coming soon');
  };

  return (
    <Link
      to={`${AppRoutes.Chat(threadChatId)}?${SearchParams.Model}=gemini-2.0-flash-lite`}
      target="_blank"
      className={cn(
        'h-7 inline-flex cursor-pointer items-center gap-x-1.5 p-1 rounded-[6px] group',
        isDetached && 'border bg-transparent'
      )}
      style={containerStyles}
    >
      <GitMerge
        className="w-[18px] h-[18px] flex-1"
        style={{ color: iconColor }}
      />
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'p-1.5 h-[22px] hidden group-hover:flex rounded-sm transition-colors duration-200',
          isDetached
            ? `bg-muted/70 text-background hover:bg-muted`
            : 'bg-background/50 hover:bg-background/70'
        )}
        style={buttonStyles}
        onClick={handleClick}
      >
        <ThemedSpan
          className="text-sm font-medium leading-none"
          style={labelStyles}
        >
          {label}
        </ThemedSpan>
      </Button>
    </Link>
  );
};

export default ConnectionTypeBadge;
