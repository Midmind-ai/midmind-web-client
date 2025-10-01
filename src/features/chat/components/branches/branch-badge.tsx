import { GitMerge, Link2Off, Link2 } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../../../../app/providers/theme-provider';
import { useChatsStore } from '../../stores/chats.store';
import { Button } from '@components/ui/button';
import { ThemedSpan } from '@components/ui/themed-span';
import { AppRoutes, SearchParams } from '@constants/paths';
import { cn } from '@utils/cn';

type Props = {
  chatId: string;
  connectionType: string;
  bgColor: string;
  branchChatId: string;
  messageId: string;
};

const CONNECTION_LABELS = {
  attached: 'Detach',
  detached: 'Attach',
};

const BranchBadge = React.memo(
  ({ bgColor, connectionType, chatId, branchChatId, messageId }: Props) => {
    const changeNestedChatConnectionType = useChatsStore(
      state => state.changeNestedChatConnectionType
    );

    const isDetached = connectionType === 'detached';
    const isAttached = connectionType === 'attached';
    const label = CONNECTION_LABELS[connectionType as keyof typeof CONNECTION_LABELS];
    const IconComponent = isDetached ? Link2 : Link2Off;

    const navigate = useNavigate();
    const { theme, resolveTheme } = useTheme();

    const containerStyles = isDetached
      ? { borderColor: bgColor }
      : { backgroundColor: bgColor };
    const themedContentColor = resolveTheme(theme) === 'light' ? 'white' : 'black';
    const iconColor = isDetached ? bgColor : themedContentColor;

    const toggleConnectionType = () => {
      const newConnectionType = isDetached ? 'attached' : isAttached ? 'detached' : '';
      if (!newConnectionType) return;
      changeNestedChatConnectionType(chatId, messageId, branchChatId, newConnectionType);
    };

    return (
      <div className="group/branch relative inline-block">
        <div
          onClick={() => {
            navigate({
              pathname: AppRoutes.Chat(chatId),
              search: `?${SearchParams.Split}=${branchChatId}`,
            });
          }}
          className={cn(
            `inline-flex h-7 cursor-pointer items-center gap-x-1.5 rounded-[6px]
            border-transparent p-1 opacity-100 shadow-xs transition-opacity
            hover:scale-110 hover:opacity-95`,
            isDetached && 'border bg-transparent shadow-none'
          )}
          style={containerStyles}
        >
          <GitMerge
            className="h-[18px] w-[18px]"
            style={{ color: iconColor }}
          />
        </div>

        <div
          className="invisible absolute top-full left-[-10px] z-10 scale-95 bg-transparent
            px-[10px] pt-[5px] opacity-0 transition-all duration-200
            group-hover/branch:visible group-hover/branch:scale-100
            group-hover/branch:opacity-100"
        >
          <Button
            variant="ghost"
            size="sm"
            className="flex h-[30px] items-center gap-1 rounded-sm p-1.5 px-3 opacity-100
              transition-opacity hover:opacity-95"
            style={{
              backgroundColor: bgColor,
              color: themedContentColor,
            }}
            onClick={toggleConnectionType}
          >
            <IconComponent
              className="h-3.5 w-3.5"
              style={{ color: themedContentColor }}
            />
            <ThemedSpan
              className="text-sm leading-none font-medium"
              style={{ color: themedContentColor }}
            >
              {label}
            </ThemedSpan>
          </Button>
        </div>
      </div>
    );
  }
);

export default BranchBadge;
