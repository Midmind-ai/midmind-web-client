import { useEffect, useRef, useState } from 'react';

import { ThemedSpan } from '@/components/ui/themed-span';
import { useInlineEditStore } from '@/stores/use-inline-edit-store';

type Props = {
  entityId: string;
  currentValue: string;
  onSave: (newValue: string) => Promise<void>;
  onCancel?: () => Promise<void>; // Optional handler for canceling new items
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
};

const EditableText = ({
  entityId,
  currentValue,
  onSave,
  onCancel,
  className = '',
  placeholder = 'Enter name...',
  autoFocus = true,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(currentValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isEditing, stopEditing } = useInlineEditStore();
  const isCurrentlyEditing = isEditing(entityId);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (isCurrentlyEditing && autoFocus) {
      // Use multiple strategies to ensure focus works
      const focusInput = () => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();

          // Verify focus worked and retry if needed
          setTimeout(() => {
            if (inputRef.current && document.activeElement !== inputRef.current) {
              inputRef.current?.focus();
            }
          }, 10);
        } else {
          // If input not ready, try again on next frame
          requestAnimationFrame(focusInput);
        }
      };

      // Try immediately and also on next frame
      focusInput();
      requestAnimationFrame(focusInput);
    }
  }, [isCurrentlyEditing, autoFocus]);

  // Reset input value when switching to edit mode
  useEffect(() => {
    if (isCurrentlyEditing) {
      setInputValue(currentValue);
    }
  }, [isCurrentlyEditing, currentValue]);

  const handleSubmit = async () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      stopEditing();

      return;
    }

    if (trimmedValue === currentValue) {
      stopEditing();

      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(trimmedValue);
      stopEditing();
    } catch (error) {
      console.error('Failed to save:', error);
      // Keep editing mode on error so user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    // If this is a new item (empty currentValue) and onCancel is provided, use it
    if (!currentValue.trim() && onCancel) {
      try {
        await onCancel();
      } catch (error) {
        console.error('Failed to cancel:', error);
      }
    }

    setInputValue(currentValue);
    stopEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }

    // Prevent all key events from bubbling up to parent components
    // This stops space/other keys from triggering parent hover effects
    e.stopPropagation();
  };

  const handleBlur = () => {
    // Only auto-submit on blur if there's a value
    if (inputValue.trim()) {
      handleSubmit();
    } else {
      handleCancel();
    }
  };

  if (isCurrentlyEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onClick={e => {
          e.stopPropagation(); // Prevent parent click handlers
        }}
        onMouseDown={e => {
          e.stopPropagation(); // Prevent parent mouse handlers
        }}
        onKeyUp={e => {
          e.stopPropagation(); // Prevent keyup from bubbling
        }}
        onKeyPress={e => {
          e.stopPropagation(); // Prevent keypress from bubbling
        }}
        onFocus={e => {
          e.stopPropagation(); // Prevent focus from bubbling
        }}
        onInput={e => {
          e.stopPropagation(); // Prevent input events from bubbling
        }}
        placeholder={placeholder}
        disabled={isSubmitting}
        className={`w-full border-0 bg-transparent outline-none ${className} ${
          isSubmitting ? 'cursor-wait opacity-50' : ''
        }`}
        // autoFocus={autoFocus} // Try native autoFocus as backup
      />
    );
  }

  return <ThemedSpan className={className}>{currentValue}</ThemedSpan>;
};

export default EditableText;
