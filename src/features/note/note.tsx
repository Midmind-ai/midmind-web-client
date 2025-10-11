import { NoteEditor } from './components/note-editor/note-editor';
import { NoteHeader } from './components/note-header/note-header';
import { NoteSkeleton } from './components/note-skeleton';
import { useNoteAutosave } from './hooks/use-note-autosave';
import { useNotesStore } from './stores/notes.store';
import { updateNoteName } from '@actions/note.actions';
import { ScrollArea } from '@components/ui/scroll-area';

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
    <ScrollArea className="h-full">
      <div className="flex min-h-full w-full flex-col gap-4 pt-10">
        <NoteHeader
          name={noteName}
          onNameChange={handleNameChange}
          type={noteState.item.type}
        />

        <div className="flex-1">
          <NoteEditor
            key={noteId}
            noteId={noteId}
            initialContent={contentJson || null}
            onContentChange={handleContentChange}
          />
        </div>

        {/* Error message */}
        {noteState.error && (
          <div className="rounded bg-red-50 p-4 text-sm text-red-600">
            {noteState.error}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default NotePage;
