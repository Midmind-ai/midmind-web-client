import { GitBranch, Copy, Link2Off, Clock, Reply } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createNestedChatAndOpenSplitScreen } from '../../../../actions/chat.actions';
import { Button } from '@components/ui/button';
import { useChatsStore } from '@features/chat/stores/chats.store';
import { useSelectionStore } from '@features/chat/stores/selection.store';
import { clearSelection } from '@features/chat/utils/text-selection';

type Props = {
  messageId: string;
  chatId: string;
};

const SelectionPopup = ({ messageId, chatId }: Props) => {
  const {
    selection,
    isPopupVisible,
    isMenuExpanded,
    popupPosition,
    clearSelection: clearSelectionState,
    expandMenu,
    collapseMenu,
  } = useSelectionStore();

  const setReplyContext = useChatsStore(state => state.setReplyContext);

  const popupRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle mouse enter with delay
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      expandMenu();
    }, 200);
  };

  // Handle mouse leave with delay
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      collapseMenu();
    }, 200);
  };

  // Clear timeout on cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        clearSelectionState();
        clearSelection();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearSelectionState();
        clearSelection();
      }
    };

    if (isPopupVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isPopupVisible, clearSelectionState]);

  const handleCopySelection = () => {
    if (selection?.selectedText) {
      navigator.clipboard.writeText(selection.selectedText);
    }
    clearSelection();
    clearSelectionState();
  };

  const handleReply = () => {
    if (selection?.selectedText) {
      // Set reply context with message ID and selected text
      setReplyContext(chatId, {
        id: messageId,
        content: selection.selectedText,
      });

      // Clear selection
      clearSelection();
      clearSelectionState();

      // Focus the chat input field
      // The chat input will auto-focus when it detects replyContext change
      const chatInput = document.querySelector(
        'textarea[placeholder*="Write a message"]'
      ) as HTMLTextAreaElement;
      if (chatInput) {
        setTimeout(() => chatInput.focus(), 100);
      }
    }
  };

  const handleCreateBranch = async (
    connectionType: 'attached' | 'detached' | 'temporary'
  ) => {
    if (!selection) return;

    await createNestedChatAndOpenSplitScreen({
      parentChatId: chatId,
      parentMessageId: messageId,
      connectionType,
      contextType: 'text_selection',
      selectedText: selection.selectedText,
      startPosition: selection.startPosition,
      endPosition: selection.endPosition,
    });

    clearSelection();
    clearSelectionState();
  };

  // Calculate smart positioning
  const getSmartPosition = () => {
    if (!popupPosition) return { left: 0, top: 0 };

    const replyButtonHeight = 44; // Fixed height of reply button
    const margin = 8;

    let { x, y } = popupPosition;

    // Since we're using translateX(-50%), x is the center point
    // Just need to ensure it doesn't go off screen
    const viewportWidth = window.innerWidth;
    const popupWidth = 200; // Max width when expanded

    // Ensure popup doesn't go beyond viewport edges
    if (x - popupWidth / 2 < margin) {
      x = popupWidth / 2 + margin;
    }
    if (x + popupWidth / 2 > viewportWidth - margin) {
      x = viewportWidth - popupWidth / 2 - margin;
    }

    // Vertical positioning - position Reply button above selection
    // The popup will expand downward from this fixed point
    y = y - replyButtonHeight - margin;

    // If not enough space above, position below selection
    if (y < margin) {
      y = popupPosition.y + margin;
    }

    return {
      left: x,
      top: y,
    };
  };

  if (!isPopupVisible || !selection || !popupPosition) {
    return null;
  }

  const position = getSmartPosition();

  return createPortal(
    <div
      ref={popupRef}
      className="fixed z-21474836472"
      style={{
        left: position.left,
        top: position.top,
        transform: 'translateX(-50%)', // Center horizontally on selection
        transformOrigin: 'top center', // Expand downward from Reply button
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-popover text-popover-foreground rounded-md border shadow-md">
        {/* Expanded Menu - Show Below Reply Button */}

        <div className="">
          <div className="flex flex-col p-1">
            {/* Primary Reply Button - Always Visible and Fixed Position */}
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground h-8 justify-start px-2 text-sm font-normal"
              onClick={handleReply}
            >
              <Reply className="text-muted-foreground mr-2 h-4 w-4" />
              Reply
            </Button>
            <div
              className={`flex flex-col transition-all duration-100 ${
                isMenuExpanded
                  ? 'animate-in slide-in-from-top-2 fade-in-0'
                  : 'animate-out slide-out-to-top-2 fade-out-0 pointer-events-none'
                }`}
              style={{
                maxHeight: isMenuExpanded ? '200px' : '0px',
                overflow: 'hidden',
              }}
            >
              <div className="bg-border my-1 h-px" />
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground h-8 justify-start px-2 text-sm font-normal"
                onClick={() => handleCreateBranch('attached')}
              >
                <GitBranch className="text-muted-foreground mr-2 h-4 w-4" />
                New attached branch
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground h-8 justify-start px-2 text-sm font-normal"
                onClick={() => handleCreateBranch('detached')}
              >
                <Link2Off className="text-muted-foreground mr-2 h-4 w-4" />
                New detached branch
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground h-8 justify-start px-2 text-sm font-normal"
                onClick={() => handleCreateBranch('temporary')}
              >
                <Clock className="text-muted-foreground mr-2 h-4 w-4" />
                New temporary branch
              </Button>
              <div className="bg-border my-1 h-px" />
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground h-8 justify-start px-2 text-sm font-normal"
                onClick={handleCopySelection}
              >
                <Copy className="text-muted-foreground mr-2 h-4 w-4" />
                Copy selection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SelectionPopup;
