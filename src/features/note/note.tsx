import { updateNoteName } from '../../actions/note.actions';
import { NoteEditor } from './components/note-editor/note-editor';
import { NoteHeader } from './components/note-header/note-header';
import { NoteSkeleton } from './components/note-skeleton';
import { useNoteAutosave } from './hooks/use-note-autosave';
import { useNotesStore } from './stores/notes.store';
import NavigationHeader from '@components/misc/navigation-header/navigation-header';

interface NotePageProps {
  noteId: string;
}

export const NotePage = ({ noteId }: NotePageProps) => {
  const notes = useNotesStore(state => state.notes);
  const updateEditorState = useNotesStore(state => state.updateEditorState);

  const noteState = notes[noteId];

  const { triggerAutosave } = useNoteAutosave(noteId);

  // Show skeleton while loading
  if (!noteState?.item) {
    return <NoteSkeleton />;
  }

  // Extract payload with type safety
  const payload = noteState.item.payload;
  const noteName = payload?.name || 'Untitled note';
  const contentJson = payload && 'content_json' in payload ? payload.content_json : null;

  const handleNameChange = (newName: string) => {
    updateNoteName(noteId, newName);
  };

  const handleContentChange = (content: Record<string, unknown>) => {
    updateEditorState(noteId, content);
    triggerAutosave();
  };

  return (
    <div className="flex h-full flex-col">
      <NavigationHeader
        id={noteId}
        showSidebarToggle
      />

      <div className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 py-10">
          <NoteHeader
            name={noteName}
            onNameChange={handleNameChange}
          />

          <NoteEditor
            noteId={noteId}
            initialContent={contentJson || null}
            onContentChange={handleContentChange}
          />

          {/* Error message */}
          {noteState.error && (
            <div className="rounded bg-red-50 p-4 text-sm text-red-600">
              {noteState.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotePage;
