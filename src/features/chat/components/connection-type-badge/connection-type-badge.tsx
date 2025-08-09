import { GitMerge } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@shared/components/ui/button';
import { ThemedSpan } from '@shared/components/ui/themed-span';

import { AppRoutes } from '@shared/constants/router';

import { cn } from '@shared/utils/cn';
import { darkenColor } from '@shared/utils/colors';

type Props = {
  connectionType: string;
  bgColor: string;
  branchChatId: string;
};

const CONNECTION_LABELS = {
  attached: 'Detach',
  detached: 'Attach',
};

const ConnectionTypeBadge = ({ bgColor, connectionType, branchChatId }: Props) => {
  const isDetached = connectionType === 'detached';
  const label = CONNECTION_LABELS[connectionType as keyof typeof CONNECTION_LABELS];

  const containerStyles = isDetached
    ? { borderColor: bgColor }
    : { backgroundColor: bgColor };
  const iconColor = isDetached ? bgColor : 'white';
  const buttonStyles = { color: bgColor };
  const labelStyles = { color: darkenColor(bgColor) };

  const handleClick = () => {
    // eslint-disable-next-line no-alert
    alert('Coming soon');
  };

  return (
    <Link
      to={AppRoutes.Chat(branchChatId)}
      target="_blank"
      className={cn(
        'group inline-flex h-7 cursor-pointer items-center gap-x-1.5 rounded-[6px] p-1',
        isDetached && 'border bg-transparent'
      )}
      style={containerStyles}
    >
      <GitMerge
        className="h-[18px] w-[18px] flex-1"
        style={{ color: iconColor }}
      />
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          `hidden h-[22px] rounded-sm p-1.5 transition-colors duration-200
          group-hover:flex`,
          isDetached
            ? 'bg-muted/70 text-background hover:bg-muted'
            : 'bg-background/50 hover:bg-background/70'
        )}
        style={buttonStyles}
        onClick={handleClick}
      >
        <ThemedSpan
          className="text-sm leading-none font-medium"
          style={labelStyles}
        >
          {label}
        </ThemedSpan>
      </Button>
    </Link>
  );
};

export default ConnectionTypeBadge;
