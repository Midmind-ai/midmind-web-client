import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Item } from '@services/items/items-dtos';
import type { UpdateNoteRequest } from '@services/notes/notes-dtos';
import { NotesService } from '@services/notes/notes-service';

// Lexical JSON type (will be properly typed when Lexical is integrated)
export type LexicalJSON = Record<string, unknown>;

// State for a single note
export interface NoteState {
  item: Item | null;
  editorState: LexicalJSON | null;
  isLoading: boolean;
  isSaving: boolean;
  isStreaming: boolean; // Future: AI streaming
  streamingContent: string | null; // Future: AI streaming
  error: string | null;
  lastSaved: Date | null;
  abortController: AbortController | null; // Future: AI streaming
}

// Initial state factory
const getInitialNoteState = (): NoteState => ({
  item: null,
  editorState: null,
  isLoading: false,
  isSaving: false,
  isStreaming: false,
  streamingContent: null,
  error: null,
  lastSaved: null,
  abortController: null,
});

export interface NotesStoreState {
  // Multi-note cache (keyed by noteId)
  notes: Record<string, NoteState>;

  // Actions
  initNote: (noteId: string, item: Item) => void;
  updateEditorState: (noteId: string, editorState: LexicalJSON) => void;
  updateName: (noteId: string, name: string) => VoidFunction;
  saveNote: (noteId: string) => Promise<void>;
  clearNote: (noteId: string) => void;
  setError: (noteId: string, error: string | null) => void;
}

export const useNotesStore = create<NotesStoreState>()(
  devtools(
    (set, get) => ({
      // Initial state
      notes: {},

      // Initialize note with item data from ItemRouter
      initNote: (noteId: string, item: Item) => {
        const { notes } = get();

        // Don't reinitialize if already exists
        if (notes[noteId]) {
          return;
        }

        // Extract content_json with type safety
        const contentJson =
          item.payload && 'content_json' in item.payload
            ? item.payload.content_json
            : null;

        set(
          state => ({
            notes: {
              ...state.notes,
              [noteId]: {
                ...getInitialNoteState(),
                item,
                editorState: contentJson || null,
              },
            },
          }),
          false,
          'initNote'
        );
      },

      // Update editor state (local only, not saved yet)
      updateEditorState: (noteId: string, editorState: LexicalJSON) => {
        const { notes } = get();
        if (!notes[noteId]) return;

        set(
          state => ({
            notes: {
              ...state.notes,
              [noteId]: {
                ...state.notes[noteId],
                editorState,
              },
            },
          }),
          false,
          'updateEditorState'
        );
      },

      // Update name and save immediately (no debounce)
      updateName: (noteId: string, name: string) => {
        const { notes } = get();
        const currentItem = notes[noteId]?.item;
        if (!currentItem) return;

        const originalState = get();

        // Update local state first
        set(
          state => ({
            notes: {
              ...state.notes,
              [noteId]: {
                ...state.notes[noteId],
                isSaving: true,
                item: {
                  ...currentItem,
                  payload: {
                    ...currentItem.payload,
                    name,
                  },
                },
              },
            },
          }),
          false,
          'updateName'
        );

        return () => {
          set(originalState);
        };
      },

      // Save note to backend
      saveNote: async (noteId: string) => {
        const noteState = get().notes[noteId];
        if (!noteState) return;

        // Prepare update request
        const updateRequest: UpdateNoteRequest = {};

        // Include name if changed
        if (noteState.item?.payload?.name) {
          updateRequest.name = noteState.item.payload.name;
        }

        // Include content_json if changed
        if (noteState.editorState) {
          updateRequest.content_json = noteState.editorState;
        }

        // Nothing to save
        if (Object.keys(updateRequest).length === 0) {
          return;
        }

        // Set saving state
        set(
          state => ({
            notes: {
              ...state.notes,
              [noteId]: {
                ...state.notes[noteId],
                isSaving: true,
                error: null,
              },
            },
          }),
          false,
          'saveNote/start'
        );

        try {
          const updatedNote = await NotesService.updateNote(noteId, updateRequest);

          set(
            state => {
              const existingItem = state.notes[noteId]?.item;

              return {
                notes: {
                  ...state.notes,
                  [noteId]: {
                    ...state.notes[noteId],
                    isSaving: false,
                    lastSaved: new Date(),
                    // Update item with response data
                    item: existingItem
                      ? {
                          ...existingItem,
                          payload: {
                            ...existingItem.payload,
                            name: updatedNote.name,
                            content_json: updatedNote.content_json,
                            content_md: updatedNote.content_md,
                          },
                          updated_at: updatedNote.updated_at,
                        }
                      : null,
                  },
                },
              };
            },
            false,
            'saveNote/success'
          );
        } catch (error) {
          set(
            state => ({
              notes: {
                ...state.notes,
                [noteId]: {
                  ...state.notes[noteId],
                  isSaving: false,
                  error: error instanceof Error ? error.message : 'Failed to save note',
                },
              },
            }),
            false,
            'saveNote/error'
          );
        }
      },

      // Clear note (called on unmount)
      clearNote: (noteId: string) => {
        const noteState = get().notes[noteId];

        // Abort any ongoing streaming
        if (noteState?.abortController) {
          noteState.abortController.abort();
        }

        set(
          state => {
            const newNotes = { ...state.notes };
            delete newNotes[noteId];

            return { notes: newNotes };
          },
          false,
          'clearNote'
        );
      },

      // Set error
      setError: (noteId: string, error: string | null) => {
        set(
          state => ({
            notes: {
              ...state.notes,
              [noteId]: {
                ...state.notes[noteId],
                error,
              },
            },
          }),
          false,
          'setError'
        );
      },
    }),
    {
      name: 'notes-store',
    }
  )
);
