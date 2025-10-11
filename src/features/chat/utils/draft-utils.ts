/**
 * Draft message utilities
 * Pure functions for draft state management and change detection
 */

export interface DraftState {
  content: string;
  attachments: Array<{ id: string }>;
  replyContext: { id: string; content: string } | null | undefined;
}

export interface DraftChanges {
  contentChanged: boolean;
  attachmentsChanged: boolean;
  replyContextChanged: boolean;
  hasAnyChange: boolean;
}

/**
 * Detects what changed between current and previous draft states
 * Pure function - no side effects, always returns the same output for same inputs
 *
 * @param current - Current draft state
 * @param previous - Previous draft state
 * @returns Object describing what changed and whether any change occurred
 *
 * @example
 * ```typescript
 * const changes = detectDraftChanges(
 *   { content: 'Hello', attachments: [], replyContext: null },
 *   { content: 'Hi', attachments: [], replyContext: null }
 * );
 * console.log(changes.contentChanged); // true
 * console.log(changes.hasAnyChange); // true
 * ```
 */
export const detectDraftChanges = (
  current: DraftState,
  previous: DraftState
): DraftChanges => {
  // 1. Check content changes
  const contentChanged = current.content !== previous.content;

  // 2. Check attachment changes (count and IDs)
  const attachmentsChanged =
    current.attachments.length !== previous.attachments.length ||
    current.attachments.some((att, i) => att.id !== previous.attachments[i]?.id);

  // 3. Check reply context changes
  // Handles null, undefined, and object property changes
  const currentReplyExists =
    current.replyContext !== null && current.replyContext !== undefined;
  const previousReplyExists =
    previous.replyContext !== null && previous.replyContext !== undefined;

  const replyContextChanged =
    currentReplyExists !== previousReplyExists ||
    current.replyContext?.id !== previous.replyContext?.id ||
    current.replyContext?.content !== previous.replyContext?.content;

  // 4. Aggregate result
  const hasAnyChange = contentChanged || attachmentsChanged || replyContextChanged;

  return {
    contentChanged,
    attachmentsChanged,
    replyContextChanged,
    hasAnyChange,
  };
};
