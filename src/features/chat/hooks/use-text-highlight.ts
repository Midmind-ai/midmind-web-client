import { useEffect, useRef } from 'react';

import type { DefiniteBranches } from '@features/chat/types/chat-types';
import { clearHighlights, highlightSelection } from '@features/chat/utils/text-selection';

import type { ChatMessage } from '@shared-types/entities';

type Args = {
  nested_chats: ChatMessage['nested_chats'];
  onOpenInSidePanel: (branchChatId: string) => void;
};

export const useTextHighlight = ({ nested_chats, onOpenInSidePanel }: Args) => {
  const messageRef = useRef<HTMLDivElement>(null);

  const textSelections = nested_chats
    .filter(
      (branch): branch is DefiniteBranches => branch.context_type === 'text_selection'
    )
    .map(branch => ({
      endPosition: branch.end_position,
      branchId: branch.child_chat_id,
      color: branch.connection_color,
      startPosition: branch.start_position,
      connectionType: branch.connection_type,
    }))
    .sort((a, b) => a.startPosition - b.startPosition);

  useEffect(() => {
    if (messageRef.current && textSelections.length > 0) {
      // The highlights need to be cleared before applying new highlights to avoid highlighting already highlighted text
      clearHighlights(messageRef.current);

      // Highlights are applied in reverse order to maintain correct indices
      for (let i = textSelections.length - 1; i >= 0; i--) {
        highlightSelection(messageRef.current, textSelections[i], onOpenInSidePanel);
      }
    }
  }, [onOpenInSidePanel, textSelections]);

  return {
    messageRef,
  };
};
