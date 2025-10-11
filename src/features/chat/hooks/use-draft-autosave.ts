import { useCallback, useEffect, useRef } from 'react';
import type { components } from '../../../../generated/api-types-new';
import type { AttachmentProgress } from '@features/chat/types/chat-types';
import { ChatsService } from '@services/chats/chats-service';

interface UseDraftAutoSaveParams {
  chatId: string | undefined;
  content: string;
  attachments: AttachmentProgress[];
  replyContext: components['schemas']['ReplyToDto'] | null | undefined;
  isStreaming: boolean;
  debounceMs?: number;
}

/**
 * Custom hook to auto-save draft messages with debounce
 * Saves when content, attachments, or reply context changes
 *
 * @param chatId - ID of the chat
 * @param content - Current message content
 * @param attachments - Current attachments
 * @param replyContext - Current reply context
 * @param isStreaming - Whether AI is currently streaming
 * @param debounceMs - Debounce delay in milliseconds (default: 1500)
 */
export const useDraftAutoSave = ({
  chatId,
  content,
  attachments,
  replyContext,
  isStreaming,
  debounceMs = 1500,
}: UseDraftAutoSaveParams) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousStateRef = useRef({ content, attachments, replyContext });
  const isInitializedRef = useRef(false);

  const saveDraft = useCallback(async () => {
    if (!chatId || isStreaming) return;

    try {
      // Extract attachment IDs (only uploaded ones)
      const attachmentIds = attachments.filter(att => att.id).map(att => att.id);

      // Save draft to backend
      await ChatsService.updateDraftMessage(chatId, {
        content,
        attachments: attachmentIds.length > 0 ? attachmentIds : null,
        reply_to_message_id: replyContext?.id || null,
        reply_content: replyContext?.content || null,
      });
    } catch (error) {
      console.error('Failed to save draft:', error);
      // Don't throw - auto-save should be silent
    }
  }, [chatId, content, attachments, replyContext, isStreaming]);

  useEffect(() => {
    // Don't auto-save if no chatId or currently streaming
    if (!chatId || isStreaming) return;

    // Check if state actually changed
    const prev = previousStateRef.current;

    // Check reply context changes (handles null, undefined, and object changes)
    const replyContextChanged =
      (replyContext === null || replyContext === undefined) !==
        (prev.replyContext === null || prev.replyContext === undefined) ||
      replyContext?.id !== prev.replyContext?.id ||
      replyContext?.content !== prev.replyContext?.content;

    const hasChanged =
      content !== prev.content ||
      attachments.length !== prev.attachments.length ||
      attachments.some((att, i) => att.id !== prev.attachments[i]?.id) ||
      replyContextChanged;

    // Update previous state
    previousStateRef.current = { content, attachments, replyContext };

    // Skip auto-save until after initial draft load and first user change
    if (!isInitializedRef.current) {
      // Mark as initialized after first state change
      if (hasChanged) {
        isInitializedRef.current = true;
      }

      return;
    }

    if (!hasChanged) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      saveDraft();
      timeoutRef.current = null;
    }, debounceMs);

    // Cleanup on dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [chatId, content, attachments, replyContext, isStreaming, debounceMs, saveDraft]);

  // Save immediately on actual unmount (if there's a pending save)
  useEffect(() => {
    return () => {
      // Only save on unmount if there's a pending timeout
      if (timeoutRef.current && chatId && !isStreaming) {
        clearTimeout(timeoutRef.current);

        // Inline save to avoid dependency issues
        const attachmentIds = attachments.filter(att => att.id).map(att => att.id);
        ChatsService.updateDraftMessage(chatId, {
          content,
          attachments: attachmentIds.length > 0 ? attachmentIds : null,
          reply_to_message_id: replyContext?.id || null,
          reply_content: replyContext?.content || null,
        }).catch(err => console.error('Failed to save draft on unmount:', err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only runs on actual component unmount
};
