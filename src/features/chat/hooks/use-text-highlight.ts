import { useEffect, useRef } from 'react';
import { clearHighlights, highlightSelection } from '@features/chat/utils/text-selection';
import type { ChatMessage } from '@shared-types/entities';

type Args = {
  nested_chats: ChatMessage['nested_chats'];
  onOpenBranch: (branchChatId: string) => void;
};

type BranchSelection = {
  endPosition: number;
  branchId: string;
  color: string;
  startPosition: number;
  connectionType: string;
};

export const useTextHighlight = ({ nested_chats, onOpenBranch }: Args) => {
  const messageRef = useRef<HTMLDivElement>(null);

  const textSelections: BranchSelection[] = nested_chats
    .filter(
      branch =>
        branch.context_type === 'text_selection' &&
        branch.end_position !== null &&
        branch.end_position !== undefined &&
        branch.start_position !== null &&
        branch.start_position !== undefined &&
        branch.connection_color &&
        branch.connection_type
    )
    .map(branch => ({
      endPosition: branch.end_position as number,
      branchId: branch.child_chat_id,
      color: branch.connection_color as string,
      startPosition: branch.start_position as number,
      connectionType: branch.connection_type as string,
    }))
    .sort((a, b) => a.startPosition - b.startPosition);

  useEffect(() => {
    if (messageRef.current && textSelections.length > 0) {
      // The highlights need to be cleared before applying new highlights to avoid highlighting already highlighted text
      clearHighlights(messageRef.current);

      // Highlights are applied in reverse order to maintain correct indices
      for (let i = textSelections.length - 1; i >= 0; i--) {
        highlightSelection(messageRef.current, textSelections[i], onOpenBranch);
      }
    }
  }, [onOpenBranch, textSelections]);

  return {
    messageRef,
  };
};
