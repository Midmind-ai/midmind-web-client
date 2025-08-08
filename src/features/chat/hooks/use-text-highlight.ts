import { useEffect, useRef } from 'react';

import type { ChatMessage } from '@shared/types/entities';

import type { DefiniteThreads } from '@features/chat/types/chat-types';
import { clearHighlights, highlightSelection } from '@features/chat/utils/text-selection';

type Args = {
  threads: ChatMessage['threads'];
  onSelectionClick: (chatId: string) => void;
};

export const useTextHighlight = ({ threads, onSelectionClick }: Args) => {
  const messageRef = useRef<HTMLDivElement>(null);

  const textSelections = threads
    .filter((thread): thread is DefiniteThreads => thread.context_type === 'text_selection')
    .map(thread => ({
      endPosition: thread.end_position,
      threadId: thread.child_chat_id,
      color: thread.connection_color,
      startPosition: thread.start_position,
      connectionType: thread.connection_type,
    }))
    .sort((a, b) => a.startPosition - b.startPosition);

  useEffect(() => {
    if (messageRef.current && textSelections.length > 0) {
      // The highlights need to be cleared before applying new highlights to avoid highlighting already highlighted text
      clearHighlights(messageRef.current);

      // Highlights are applied in reverse order to maintain correct indices
      for (let i = textSelections.length - 1; i >= 0; i--) {
        highlightSelection(messageRef.current, textSelections[i], onSelectionClick);
      }
    }
  }, [onSelectionClick, textSelections]);

  return {
    messageRef,
  };
};
