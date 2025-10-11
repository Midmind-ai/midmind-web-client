# Chat Feature

## Overview

The Chat feature is a real-time AI conversation interface that supports hierarchical, branching conversations with context-aware responses. Users can chat with AI models, create nested chat branches from any message or text selection, and manage conversation threads with different connection types (attached, detached, temporary).

## Business Logic

### Core Functionality

1. **Real-time AI Conversations**
   - Send messages to AI models and receive streaming responses
   - Support for multiple AI models (see `@constants/ai-models.ts`)
   - Server-Sent Events (SSE) for real-time response streaming
   - Optimistic UI updates for instant feedback

2. **Message Management**
   - Paginated message loading (see `ITEMS_PER_PAGE` in `stores/chats.store.ts`)
   - Infinite scroll for loading historical messages
   - Draft message auto-save with configurable debounce (see `use-draft-autosave.ts`)
   - Reply-to-message functionality with context preview
   - Message enrichment from backend (adds default values for optional fields)

3. **File Attachments**
   - Image upload with progress tracking
   - Drag-and-drop file handling
   - Paste from clipboard support
   - Multiple file attachments per message
   - File preview in modal viewer

4. **Nested Chat Branches (Hierarchical Conversations)**
   - Create child chats from any message or text selection
   - Three connection types:
     - **Attached**: Tightly coupled branch, shown inline
     - **Detached**: Independent branch, shown as separate badge
     - **Temporary**: Ephemeral branch for quick explorations
   - Visual branch indicators with random colors
   - Text selection highlighting for context visualization
   - Branch context types:
     - Full message context
     - Text selection context (with start/end positions)

5. **Text Selection Features**
   - Select text within AI messages
   - Quick actions on selection:
     - Reply to selected text
     - Create attached/detached/temporary branch
     - Copy selection to clipboard
   - Hover-based menu expansion
   - Smart positioning (stays on screen, avoids edges)

6. **Draft Management**
   - Auto-save draft messages with debounce (configurable in `use-draft-autosave.ts`)
   - Save on component unmount (if pending changes)
   - Persist content, attachments, and reply context
   - Load draft on chat mount
   - Change detection for efficient saves

## Architecture

### State Management (Zustand)

**Main Store**: `stores/chats.store.ts`

- **Pattern**: Multi-chat state with per-chat isolation
- **Structure**: `Record<chatId, ChatState>` for managing multiple active chats
- **Slices**: Uses Zustand slice pattern for modularity

**Chat Branches Slice**: `stores/slices/chat-branches.slice.ts`

- Handles all nested chat/branching logic
- Optimistic updates with rollback on error
- Isolated from main store for better maintainability

**State Shape**: See `ChatState` and `ChatsStoreState` interfaces in `stores/chats.store.ts`

### Streaming Architecture

**File**: `stores/streaming.ts`

**Closure Pattern for State Encapsulation**:

- `createStreamProcessor(set, chatId, aiMessageId)` returns a closure
- Accumulates streaming content across chunk callbacks
- Encapsulates transient state (`accumulatedContent`, `titleUpdated`)
- Automatically garbage collected when stream completes

**Why Closure Pattern?**

- SSE streams require stateful processing across multiple callbacks
- State must persist between chunk events
- Clean separation: transient streaming state doesn't pollute Zustand store
- Supports concurrent streams (each has isolated state)

**Stream Events**:

- `content`: Accumulate AI response chunks
- `title`: Update chat title (once per stream)
- `complete`: Finalize message, clear streaming state
- `error`: Handle errors, show error UI

### Component Hierarchy

Components are organized to reflect actual UI composition:

```
chat (main container)
├── messages (message list)
│   ├── messages-skeleton (loading state)
│   ├── selection-popup (text selection UI)
│   └── components/
│       ├── ai-message
│       │   ├── markdown (rendered content)
│       │   ├── typing-dots (loading state)
│       │   ├── branches (nested chat badges)
│       │   │   └── branch-badge
│       │   └── quick-actions (message actions)
│       │       └── quick-action-button
│       └── user-message
│           ├── message-reply (reply preview)
│           └── image-with-fallback (attachments)
└── chat-input (input form)
    ├── global-file-drop-zone (drag & drop wrapper)
    ├── message-reply (reply preview in input)
    ├── model-selector (AI model picker)
    └── image-upload-progress (per file)
```

**Design Principle**: Each parent component folder contains its children components, making ownership and relationships explicit.

### Data Flow

**Loading a Chat**:

1. `initChatData(chatId)` triggered on mount
2. Parallel: `initChat()`, `loadMessages()`, `loadDraftMessage()`
3. Messages enriched with default values
4. Attachments loaded for messages with files
5. Draft restored (if exists) with content, attachments, reply context

**Sending a Message**:

1. Create optimistic user & AI messages
2. Add both to state immediately (optimistic update)
3. Setup AbortController for stream cancellation
4. Create stream processor (closure with accumulated state)
5. Stream SSE events, update AI message progressively
6. On complete: finalize message, clear streaming state
7. On error: show error, keep abort capability

**Creating a Branch**:

1. User action: click "New branch" or select text
2. Optimistic update: add branch context to parent message
3. Generate random color for branch badge
4. Return rollback function for error handling
5. Backend persists branch metadata
6. On error: rollback optimistic update

### Key Patterns

**1. Optimistic Updates**:

- Update UI immediately for perceived performance
- Backend call happens in background
- Rollback on error with saved previous state

**2. Pure Functions for Business Logic**:

- `enrichMessage(msg)`: Adds default values to backend messages
- `detectDraftChanges(current, previous)`: Change detection for auto-save
- `createOptimisticUserMessage()`: Generates optimistic user message
- `createOptimisticAIMessage()`: Generates placeholder AI message

**3. Helper Action Pattern**:

- `updateChatState(chatId, updates)`: Centralized state update
- Reduces repetition across store actions
- Consistent state update pattern across store

**4. Component Isolation**:

- Child components only imported by their parent
- No shared state between ai-message and user-message
- Changes to one component tree don't affect others

## Hooks

### Custom Hooks

**`use-draft-autosave.ts`**:

- Debounced auto-save (configurable delay)
- Change detection using pure function
- Skips save on component mount (prevents overwriting loaded draft)
- Immediate save on unmount (if pending changes)
- Handles content, attachments, and reply context

**`use-draft-message-loader.ts`**:

- Loads draft from store on mount
- Sets content and attachments in input
- One-time effect (doesn't re-run on state changes)

**`use-file-upload.ts`**:

- Handles file upload with progress tracking
- Supports drag-and-drop and paste
- Multiple file attachments
- Upload to backend, get file IDs
- Local file preview during upload

**`use-text-highlight.ts`**:

- Highlights text selections in messages
- Creates highlight spans for branch context
- Clickable highlights to open branch chats
- Uses DOM manipulation for performance

**`use-global-selection-detection.ts`**:

- Detects text selection within messages
- Calculates selection position (for popup)
- Updates selection store with context
- Only active when not streaming (to avoid conflicts)

## Services

**`ChatsService`** (`services/chats/chats-service.ts`):

- `getMessages(chatId, {offset, limit})`: Paginated message fetching
- `getDraftMessage(chatId)`: Load draft
- `updateDraftMessage(chatId, draft)`: Save draft
- `sendMessage(chatId, data, onChunk, signal)`: Stream SSE response

**`FilesService`** (`services/files/files-service.ts`):

- `uploadFile(file)`: Upload with progress
- `getFile(fileId)`: Get file metadata & URL

**`ChatMetadataService`** (`services/chat-metadata/chat-metadata-service.ts`):

- `updateChatMetadata(chatId, updates)`: Update branch connection type

## Data Models

Type definitions are organized in multiple files:

### Frontend Entity Types

**File**: `@shared-types/entities.ts` (alias for `src/types/entities.ts`)

Defines frontend-specific models:

- `ChatMessage` - Message entity with enriched fields (`reply_content`, `nested_chats`, `attachments`)
- `ChatBranchContext` - Nested chat metadata with connection type and context
- `Chat` - Chat entity
- `AIModel` - AI model identifier type

### Backend DTOs (Legacy)

**File**: `@services/chats/chats-dtos.ts`

Contains request/response DTOs for chat API:

- `SendMessageRequestDto`
- `ReplyToDto` - Reply context (`id`, `content`)
- Message attachment types

### Auto-generated API Types

**File**: `generated/api-types-new.ts`

OpenAPI-generated types (preferred for new code):

- `components['schemas']['ReplyToDto']`
- Backend contract types

## Type System

**Hybrid Approach** (migration in progress):

- **Auto-generated types**: `generated/api-types-new.ts` (from OpenAPI)
- **Manual types**: `@services/chats/chats-dtos.ts` (legacy)
- **Bridge types**: `@shared-types/entities.ts` (frontend-specific)

**Current Issue**: Three sources of truth create sync gaps
**Long-term Solution**: Migrate fully to auto-generated types

## Performance Optimizations

1. **Memo-ized Components**:
   - `AIMessage`, `UserMessage`, `Messages` use `memo()`
   - Prevents unnecessary re-renders

2. **Pagination**:
   - Load messages in configurable batches (see `ITEMS_PER_PAGE` constant)
   - Infinite scroll for older messages
   - Avoids loading entire conversation history

3. **Debounced Auto-Save**:
   - Configurable delay prevents excessive backend calls
   - Change detection avoids no-op saves

4. **Optimistic Updates**:
   - Instant UI feedback
   - No waiting for backend confirmation

5. **Closure Pattern for Streaming**:
   - Encapsulated state (no store pollution)
   - Automatic garbage collection
   - Efficient memory usage

## Error Handling

**Stream Errors**:

- Caught in `sendMessage` try-catch
- Display error message in AI message
- AbortError silently ignored (user-initiated cancellation)

**Optimistic Update Failures**:

- Rollback functions restore previous state
- User sees error notification
- State consistency maintained

**Draft Save Failures**:

- Silent failures (non-critical)
- Logged to console for debugging
- User's work not lost (stays in input)

## Future Improvements (Phase 3 - Optional)

1. **Further Store Slicing**:
   - Extract messages slice (CRUD operations)
   - Extract drafts slice (management logic)
   - Each slice focused on single concern

2. **Message Adapter Layer**:
   - Centralized backend→frontend transformation
   - Runtime validation (Zod/Yup)
   - Type safety guarantees

## Related Files

### Core Files

- `chat.tsx` - Main chat container
- `stores/chats.store.ts` - Zustand state management
- `stores/slices/chat-branches.slice.ts` - Branch logic
- `stores/streaming.ts` - SSE streaming helpers
- `stores/draft-utils.ts` - Draft change detection
- `components/messages/messages.tsx` - Message list
- `components/chat-input/chat-input.tsx` - Input form

### Services

- `services/chats/chats-service.ts` - Chat API client
- `services/files/files-service.ts` - File upload/download
- `services/chat-metadata/chat-metadata-service.ts` - Branch metadata

### Types

- `@shared-types/entities.ts` - Frontend entity types
- `generated/api-types-new.ts` - Auto-generated from OpenAPI
- `@services/chats/chats-dtos.ts` - Legacy manual types

---

**Architecture Pattern**: React + Zustand + SSE Streaming
**Key Principles**: Optimistic updates, component isolation, hierarchical organization
