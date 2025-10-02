import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ThemedSpan } from '@components/ui/themed-span';
import { Tooltip, TooltipTrigger, TooltipContent } from '@components/ui/tooltip';
import { useIsTextTruncated } from '@hooks/utils/use-is-text-truncated';
import { cn } from '@utils/cn';

type Props = {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  clickToEdit?: boolean;
  onCancel?: VoidFunction;
};

export type EditableTextRef = {
  isEditing: boolean;
  startEditing: VoidFunction;
  stopEditing: VoidFunction;
};

const InlineEditableText = forwardRef<EditableTextRef, Props>(
  (
    {
      value,
      onSave,
      onCancel,
      className = '',
      placeholder = 'Enter text...',
      disabled = false,
      autoFocus = true,
      clickToEdit = true,
    },
    ref
  ) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    const { textRef, isTruncated } = useIsTextTruncated(value);

    const handleClick = () => {
      if (clickToEdit && !disabled && !isEditing) {
        setInputValue(value);
        setIsEditing(true);
      }
    };

    const handleSave = () => {
      const trimmedValue = inputValue.trim();
      if (trimmedValue && trimmedValue !== value) {
        onSave(trimmedValue);
      }
      setIsEditing(false);
    };

    const handleCancel = () => {
      setInputValue(value);
      setIsEditing(false);
      onCancel?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    const handleBlur = () => {
      handleSave();
    };

    useImperativeHandle(ref, () => ({
      startEditing: () => {
        if (!disabled && !isEditing) {
          setInputValue(value);
          setIsEditing(true);
        }
      },
      stopEditing: () => {
        if (isEditing) {
          setIsEditing(false);
        }
      },
      isEditing,
    }));

    useEffect(() => {
      if (isEditing && autoFocus && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing, autoFocus]);

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'bg-accent inlin-block h-14 w-full rounded-md border-0 p-2 outline-none',
            className
          )}
        />
      );
    }

    const textElement = (
      <ThemedSpan
        ref={textRef}
        onClick={handleClick}
        className={cn(
          `hover:bg-accent inline h-14 w-fit max-w-full overflow-hidden rounded-md p-2
          text-ellipsis whitespace-nowrap`,
          clickToEdit && !disabled ? 'cursor-text' : 'cursor-default',
          className
        )}
      >
        {value}
      </ThemedSpan>
    );

    return isTruncated ? (
      <Tooltip>
        <TooltipTrigger asChild>{textElement}</TooltipTrigger>
        <TooltipContent>
          <p>{value}</p>
        </TooltipContent>
      </Tooltip>
    ) : (
      textElement
    );
  }
);

export default InlineEditableText;
