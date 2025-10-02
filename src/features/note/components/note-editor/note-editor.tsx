import type { LexicalJSON } from '@services/notes/notes-dtos';

interface NoteEditorProps {
  noteId: string;
  initialContent: LexicalJSON | null;
  onContentChange: (content: LexicalJSON) => void;
}

/**
 * Note editor component
 * TODO: Integrate Lexical editor when ready
 * For now, shows placeholder for content
 */
export const NoteEditor = ({ initialContent }: NoteEditorProps) => {
  return (
    <div className="flex-1">
      {/* Placeholder for Lexical editor */}
      <div className="rounded border border-gray-200 p-4">
        <p className="text-gray-500">Lexical editor will be integrated here</p>
        {initialContent && (
          <pre className="mt-4 text-xs text-gray-400">
            {JSON.stringify(initialContent, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
