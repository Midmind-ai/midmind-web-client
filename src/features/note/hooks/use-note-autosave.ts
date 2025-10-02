import { useCallback, useRef, useEffect } from 'react';
import { useNotesStore } from '../stores/notes.store';

const AUTOSAVE_DELAY = 1500; // 1.5 seconds

/**
 * Hook for debounced autosave functionality
 * Automatically saves note changes after 1.5 seconds of inactivity
 */
export const useNoteAutosave = (noteId: string) => {
  const saveNote = useNotesStore(state => state.saveNote);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const triggerAutosave = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      await saveNote(noteId);
    }, AUTOSAVE_DELAY);
  }, [noteId, saveNote]);

  // Manual save (for explicit save actions)
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await saveNote(noteId);
  }, [noteId, saveNote]);

  return {
    triggerAutosave,
    saveNow,
  };
};
