import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import type { EditorState } from 'lexical';
import type { LexicalJSON } from '@services/notes/notes-dtos';

interface NoteEditorProps {
  noteId: string;
  initialContent: LexicalJSON | null;
  onContentChange: (content: LexicalJSON) => void;
}

const theme = {
  paragraph: 'mb-2',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
};

function onError(error: Error) {
  console.error('Lexical error:', error);
}

/**
 * Note editor component with Lexical
 * Stores editor state locally and syncs via onContentChange callback
 */
export const NoteEditor = ({ initialContent, onContentChange }: NoteEditorProps) => {
  const initialConfig = {
    namespace: 'NoteEditor',
    theme,
    onError,
    editorState: initialContent ? JSON.stringify(initialContent) : undefined,
  };

  const handleEditorChange = (state: EditorState) => {
    const json = state.toJSON();
    onContentChange(json as unknown as LexicalJSON);
  };

  // Check if content is actually empty by looking at the root children
  const isContentEmpty = () => {
    if (!initialContent) return true;

    // Type guard to check if root has children property
    const root = initialContent.root as { children?: unknown[] } | undefined;
    if (!root || !root.children || root.children.length === 0) return true;

    // Check if all children are empty
    return root.children.every((child: unknown) => {
      const childNode = child as { children?: unknown[] };

      return !childNode.children || childNode.children.length === 0;
    });
  };

  const shouldAutoFocus = isContentEmpty();

  return (
    <div className="h-full">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative h-full rounded">
          <PlainTextPlugin
            contentEditable={
              <ContentEditable
                className="h-full resize-none p-2 px-32 pb-10 text-base outline-none"
              />
            }
            placeholder={
              <div
                className="text-muted-foreground pointer-events-none absolute top-2
                  left-32 opacity-70"
              >
                Enter note text
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleEditorChange} />
          <HistoryPlugin />
          {shouldAutoFocus && <AutoFocusPlugin />}
        </div>
      </LexicalComposer>
    </div>
  );
};
