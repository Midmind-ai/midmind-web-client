import { useCallback, useEffect, useRef } from 'react';
import { detectDraftChanges } from '../utils/draft-utils';
import type { AttachmentProgress } from '@features/chat/types/chat-types';
import { ChatsService } from '@services/chats/chats-service';

interface UseDraftAutoSaveParams {
  chatId: string | undefined;
  content: string;
  attachments: AttachmentProgress[];
  replyContext: { id: string; content: string } | null | undefined;
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
  debounceMs = 1000,
}: UseDraftAutoSaveParams) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);
  const previousStateRef = useRef<{
    content: string;
    attachments: AttachmentProgress[];
    replyContext: { id: string; content: string } | null | undefined;
  }>({ content: '', attachments: [], replyContext: null });

  const saveDraft = useCallback(async () => {
    if (!chatId || isStreaming) return;

    try {
      // Save draft to backend
      await ChatsService.updateDraftMessage(chatId, {
        content,
        reply_to_message_id: replyContext?.id || null,
        reply_content: replyContext?.content || null,
      });
    } catch (error) {
      console.error('Failed to save draft:', error);
      // Don't throw - auto-save should be silent
    }
  }, [chatId, content, replyContext, isStreaming]);

  useEffect(() => {
    // Skip the very first effect run (component mount)
    // This prevents saving when draft is initially loaded from backend
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      previousStateRef.current = { content, attachments, replyContext };

      return;
    }

    // Don't auto-save if no chatId or currently streaming
    if (!chatId || isStreaming) return;

    // Check if state actually changed using pure function
    const changes = detectDraftChanges(
      { content, attachments, replyContext },
      previousStateRef.current
    );

    // Update previous state
    previousStateRef.current = { content, attachments, replyContext };

    // If nothing changed, don't trigger save
    if (!changes.hasAnyChange) return;

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
        ChatsService.updateDraftMessage(chatId, {
          content,
          reply_to_message_id: replyContext?.id || null,
          reply_content: replyContext?.content || null,
        }).catch(err => console.error('Failed to save draft on unmount:', err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only runs on actual component unmount
};
