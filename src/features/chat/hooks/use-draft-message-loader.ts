import { useEffect, useRef } from 'react';
import type { ChatState } from '@features/chat/stores/chats.store';
import type { AttachmentProgress } from '@features/chat/types/chat-types';

interface UseDraftMessageLoaderParams {
  chatId?: string;
  chatState: ChatState | undefined;
  onContentChange: (content: string) => void;
  onAttachmentsChange: (attachments: AttachmentProgress[]) => void;
}

/**
 * Custom hook to load draft message content and attachments on mount
 * Populates chat input with draft data if it exists and has non-empty content
 */
export const useDraftMessageLoader = ({
  chatId,
  chatState,
  onContentChange,
  onAttachmentsChange,
}: UseDraftMessageLoaderParams) => {
  const draftLoadedRef = useRef(false);

  useEffect(() => {
    const draftMessage = chatState?.draftMessage;

    if (
      chatId &&
      draftMessage &&
      draftMessage.content &&
      draftMessage.content.trim() !== '' &&
      !draftLoadedRef.current
    ) {
      // Populate content
      onContentChange(draftMessage.content);

      // Populate attachments from store
      const storeAttachments = chatState.attachments || [];
      const attachmentProgress: AttachmentProgress[] = storeAttachments.map(att => ({
        id: att.id,
        progress: 100,
        file: new File([], att.file_name, { type: 'application/octet-stream' }),
      }));

      onAttachmentsChange(attachmentProgress);
      draftLoadedRef.current = true;
    }
  }, [
    chatId,
    chatState?.draftMessage,
    chatState?.attachments,
    onContentChange,
    onAttachmentsChange,
  ]);
};
