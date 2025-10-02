//

import { useFileSystemStore } from '../features/file-system/stores/file-system.store';
import { useNotesStore } from '../features/note/stores/notes.store';
import { NotesService } from '../services/notes/notes-service';

// src/actions/note.actions.ts (already exists!)
export const updateNoteName = async (noteId: string, name: string) => {
  // Update both stores
  const rollbackNoteStore = useNotesStore.getState().updateName(noteId, name);
  const rollbackFileSystemStore = useFileSystemStore.getState().renameItem(noteId, name);

  try {
    await NotesService.updateNote(noteId, { name });
  } catch (e) {
    rollbackNoteStore();
    rollbackFileSystemStore();
    throw e;
  }
};
