# Note Feature

Refactored note functionality with clean architecture and multi-note support.

## Architecture

### Data Flow

```
ItemRouter (fetches item) → initNote(item) → notes.store.ts → NotePage (renders)
```

### Multi-Note Support

- **Store**: Record<noteId, NoteState> - caches multiple notes
- **Active notes**: Determined by URL (query params)
- **Cleanup**: Automatic on component unmount

### URL Structure

```
/items/note-1-uuid                    → Single note
/items/note-1-uuid?right=note-2-uuid  → Split view (2 notes)
```

## File Structure

```
src/features/note/
├── note.tsx                          # Main component (~70 lines)
├── components/
│   ├── note-header/
│   │   └── note-header.tsx          # Title + save indicator
│   ├── note-editor/
│   │   └── note-editor.tsx          # Lexical editor placeholder
│   └── note-skeleton.tsx            # Loading skeleton
├── hooks/
│   └── use-note-autosave.ts         # Debounced save (2.5s)
└── stores/
    └── notes.store.ts               # Zustand multi-note store

src/services/notes/
├── notes-dtos.ts                    # TypeScript types
└── notes-service.ts                 # API: PATCH /notes/:id
```

## Features

✅ **Multi-note caching** - Store structure like chats.store.ts
✅ **URL-based active notes** - No activeNoteIds in store
✅ **Autosave** - 2.5s debounce after changes
✅ **Reuses ItemRouter data** - No duplicate fetching
✅ **Clean component** - Main component is 70 lines
✅ **Save indicators** - Shows "Saving..." and last saved time
✅ **Error handling** - Displays API errors
✅ **Streaming-ready** - Store structure supports future AI streaming

## Usage

### Single Note

```typescript
// URL: /items/note-uuid
// ItemRouter fetches item → initNote() → NotePage renders
```

### Split View (Multi-note)

```typescript
// URL: /items/note-1?right=note-2
// Layout renders:
<div className="flex">
  <ItemRouter key={note1Id} /> → NotePage
  <ItemRouter key={note2Id} /> → NotePage
</div>
```

## Store API

```typescript
// Initialize note (called from ItemRouter)
initNote(noteId: string, item: Item): void

// Update editor state (triggers autosave)
updateEditorState(noteId: string, state: LexicalJSON): void

// Update name (triggers autosave)
updateName(noteId: string, name: string): void

// Manual save
saveNote(noteId: string): Promise<void>

// Cleanup (called on unmount)
clearNote(noteId: string): void
```

## Next Steps

### Lexical Editor Integration

Replace `note-editor.tsx` placeholder with:

- LexicalComposer
- RichTextPlugin
- OnChangePlugin
- Toolbar (heading, bold, italic, lists, links)

### AI Streaming (Future)

Store is ready with:

- `isStreaming: boolean`
- `streamingContent: string`
- `abortController: AbortController`

Add streaming actions similar to chats.store.ts

## Backend Integration

Connects to:

- `PATCH /notes/:id` - Update note
  - Request: `{ name?, content_json?, content_md? }`
  - Response: `{ id, name, content_json, content_md, updated_at }`

Auto-generates `content_md` if not provided.
