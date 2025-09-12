import { useEffect } from 'react';
import { useSelectionStore } from '@features/chat/stores/selection.store';
import {
  captureSelection,
  hasSelectionWithinElement,
  getSelectionPosition,
} from '@features/chat/utils/text-selection';
import type { ChatMessage } from '@shared-types/entities';

type UseGlobalSelectionDetectionProps = {
  messages: ChatMessage[];
  chatId: string;
  isStreaming: boolean;
};

/**
 * Hook to detect text selections in AI messages globally
 * Handles all selection detection using data-message-id attributes
 * Works regardless of where the mouse up event occurs
 */
export const useGlobalSelectionDetection = ({
  messages,
  chatId,
  isStreaming,
}: UseGlobalSelectionDetectionProps) => {
  const { setSelection } = useSelectionStore();

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isStreaming) return; // Don't handle selections during streaming

      // Small delay to ensure selection is complete
      setTimeout(() => {
        // Check each AI message to see if it contains the selection
        const aiMessages = messages.filter(msg => msg.role === 'model');

        for (const message of aiMessages) {
          const messageElement = document.querySelector(
            `[data-message-id="${message.id}"]`
          );
          if (messageElement && hasSelectionWithinElement(messageElement)) {
            const selectionContext = captureSelection(messageElement);
            const position = getSelectionPosition();

            if (selectionContext && position) {
              setSelection(selectionContext, message.id, chatId, position);

              return; // Found selection, exit early
            }
          }
        }
      }, 10);
    };

    // Add global event listener
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [messages, chatId, isStreaming, setSelection]);
};
