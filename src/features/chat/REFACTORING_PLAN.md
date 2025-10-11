# Chat Feature Refactoring Plan

## 🚨 Pre-Refactoring: Fix Type Misalignment (COMPLETED ✅)

### Step 1: Fix Immediate Type Errors (COMPLETED ✅)

**Problem**: TypeScript errors appeared due to misalignment between frontend optimistic updates and auto-generated backend types.

**Errors Fixed**:

1. ✅ Missing `is_draft: boolean` field in optimistic message creation (`chats.store.ts:399, 413`)
   - Added `is_draft: false` to both `userMessage` and `aiMessage` objects
2. ✅ Model type mismatch - `AIModel` was `string`, but backend expects strict `LLModel` enum
   - Updated `AIModel` type in `entities.ts:38` to use `componentsNew['schemas']['LLModel']`
   - Now properly typed as: `"gemini-2.0-flash-lite" | "gemini-2.0-flash" | "gemini-2.5-flash" | "gemini-2.5-pro"`

**Files Changed**:

- `src/features/chat/stores/chats.store.ts` (lines 407, 422)
- `src/types/entities.ts` (lines 3, 39)

### Step 2: Long-Term Type System Alignment (FUTURE WORK)

**Root Cause**: Hybrid type system with 3 different type sources that aren't synchronized:

1. **Manual types** (`@services/chats/chats-dtos.ts`) - Old, manually maintained
2. **Auto-generated types** (`generated/api-types-new.ts`) - New, from OpenAPI
3. **Bridge types** (`types/entities.ts`) - Frontend definitions that combine both

**Problem**: When backend adds/changes fields in OpenAPI schema, frontend must manually:

- Update auto-generated types (via regeneration)
- Update manual DTOs (if using old types)
- Update bridge types (like `AIModel`, `ChatMessage`)
- Update usage sites (like optimistic message creation)

This creates synchronization gaps and type errors.

**Long-Term Solution** (Defer until after refactoring):

#### Option A: Full Migration to Auto-Generated Types (Recommended)

1. **Audit**: Identify all manual type definitions in `@services/chats/chats-dtos.ts`
2. **Migrate**: Replace manual types with auto-generated types from `api-types-new.ts`
3. **Delete**: Remove redundant manual type definitions
4. **Update imports**: Change all imports to use `generated/api-types-new`
5. **Consolidate**: Keep only necessary bridge types in `entities.ts`

**Benefits**:

- Single source of truth (OpenAPI schema)
- Automatic type updates on backend changes
- No synchronization errors
- Better IDE intellisense

**Risks**:

- Large migration effort (~50+ files)
- Potential breaking changes
- Requires careful testing

#### Option B: Type Adapter Layer (Alternative)

1. Create `adapters/types.adapter.ts`
2. Map between auto-generated and manual types
3. Add runtime validation with Zod/Yup
4. Gradual migration path

**Decision**: Defer until after Phase 1-2 refactoring is complete. Current fix (Step 1) is sufficient for immediate needs.

---

## 🎯 Main Issues Identified

### 1. **Store Complexity & Repetitive State Updates** (chats.store.ts - 808 lines)

- **Problem**: Repetitive `set(state => ({ chats: { ...state.chats, [chatId]: { ...state.chats[chatId], ... }}}))` pattern appears ~20 times
- **Impact**: Hard to read, error-prone, makes changes difficult
- **Solution**: Extract a helper function `updateChatState(chatId, updates)` to simplify state updates

### 2. **Message Enrichment Duplication**

- **Problem**: Same "add default values" logic repeated in 3 places:
  - `loadMessages` (lines 211-216)
  - `loadMoreMessages` (lines 343-348)
  - `loadDraftMessage` (lines 255-259)
- **Solution**: Extract `enrichMessage(msg): ChatMessage` helper function

### 3. **Attachment Loading Scattered**

- **Problem**: Attachment loading logic is mixed into message loading
- **Impact**: Makes message loading harder to follow
- **Solution**: Keep `loadAttachments` as separate concern, but clarify when/why it's called

### 4. **Draft Auto-Save Hook Complexity**

- **Problem**: Complex change detection logic with multiple refs (lines 62-76 in use-draft-autosave.ts)
- **Impact**: Hard to understand when saves trigger
- **Solution**: Extract change detection into a separate pure function for testability

### 5. **sendMessage Action Too Large** (380-600 lines)

- **Problem**: Handles too many concerns:
  - Message creation
  - Optimistic updates
  - SSE streaming
  - Error handling
  - Title updates
  - Abort controller management
- **Solution**: Split into smaller functions:
  - `createOptimisticMessages()`
  - `handleStreamChunk()`
  - `handleStreamComplete/Error()`

### 6. **Nested Chat Logic Mixed In**

- **Problem**: `appendNewNestedChat` and `changeNestedChatConnectionType` are in main store but are complex features
- **Solution**: Consider extracting to separate concern/slice

### 7. **Type Safety: Message Enrichment**

- **Problem**: Backend returns partial messages, frontend adds defaults
- **Impact**: Type mismatches, potential runtime errors
- **Solution**: Create clear adapter functions with type guards

## 📋 Proposed Refactoring Plan

### Phase 1: Extract Helper Functions (Low Risk) ✅ COMPLETED

**Goal**: Reduce code duplication and improve readability with minimal risk

#### Task 1.1: Create State Update Helper ✅

- [x] Extract `updateChatState(chatId, updates)` helper as public store action
- [x] Add to `ChatsStoreState` interface
- [x] Replace all repetitive state updates with helper (13 locations)
- [x] Test: Ensure all chat operations still work

**Implementation** (`chats.store.ts:75, 129`):

```typescript
// Interface (line 75)
updateChatState: (chatId: string, updates: Partial<ChatState>) => void;

// Implementation (line 129)
updateChatState: (chatId: string, updates: Partial<ChatState>) => {
  set((state: ChatsStoreState) => ({
    chats: {
      ...state.chats,
      [chatId]: {
        ...state.chats[chatId],
        ...updates,
      },
    },
  }));
},
```

**Usage**: Can be used internally via `get().updateChatState(chatId, updates)` or externally via `useChatsStore.getState().updateChatState(chatId, updates)`

#### Task 1.2: Create Message Enrichment Helper ✅

- [x] Create `enrichMessage(msg): ChatMessage` function
- [x] Replace duplication in `loadMessages`, `loadMoreMessages`, `loadDraftMessage`
- [x] Test: Verify messages load correctly with all default fields

**Implementation** (`chats.store.ts:45`):

```typescript
/**
 * Helper to normalize messages from backend
 * Adds default values for fields that backend doesn't populate yet
 */
const enrichMessage = (msg: any): ChatMessage => ({
  ...msg,
  reply_content: msg.reply_content ?? null,
  nested_chats: msg.nested_chats ?? [],
  attachments: msg.attachments ?? [],
});
```

#### Task 1.3: Extract Draft Change Detection ⏭️ DEFERRED

- [ ] Create `detectDraftChanges(current, previous)` pure function
- [ ] Move logic from `useDraftAutoSave` hook lines 62-76
- [ ] Add unit tests for change detection
- [ ] Test: Verify auto-save triggers correctly

**Note**: This task has been deferred to Stage 2: Simplify Draft Auto-Save Logic

---

### 📊 Phase 1 Results

**Lines Reduced**: ~88 lines (808 → ~720 lines)
**Patterns Simplified**: 13 state updates replaced with `updateChatState()` calls
**Code Duplication Eliminated**: 3 message enrichment blocks → 1 helper function
**Type Safety Improved**: Public store action with proper interface definition

**Files Modified**:

- `/Users/maksimgaponenko/Work/Midmind/midmind-web-client/src/features/chat/stores/chats.store.ts`

**Locations Updated**:

1. `loadChat` - 3 calls to `updateChatState()`
2. `loadMessages` - 2 calls to `updateChatState()` + `enrichMessage()`
3. `loadDraftMessage` - 2 calls to `updateChatState()` + `enrichMessage()`
4. `loadMoreMessages` - 2 calls to `updateChatState()` + `enrichMessage()`
5. `sendMessage` - 1 call to `updateChatState()`
6. `stopStreaming` - 1 call to `updateChatState()`
7. `setReplyContext` - 1 call to `updateChatState()`
8. `setError` - 1 call to `updateChatState()`

**Expected Outcome**: ✅ Code is clearer, easier to maintain, and provides a reusable state update pattern for future slices

---

**Date Completed**: 2025-01-11

---

### Phase 2: Extract Streaming Logic to Separate File (Medium Risk) ✅ COMPLETED

**Goal**: Extract all streaming-related logic into a separate file for better modularity and separation of concerns

#### Implementation ✅

**Created New File**: `src/features/chat/stores/streaming.ts` (~233 lines)

**Pure Functions (Optimistic Message Creators)**:

- [x] `createOptimisticUserMessage(params): ChatMessage` - Creates user message for immediate UI display
- [x] `createOptimisticAIMessage(params): ChatMessage` - Creates empty AI message for streaming
- [x] `createLocalAttachments(files, attachments)` - Maps files to local attachment objects

**Stream Processor (Closure Pattern)**:

- [x] `createStreamProcessor(set, chatId, aiMessageId)` - Factory function that returns SSE event processor
  - Returns a closure function that processes SSE chunks
  - Encapsulates streaming state (`accumulatedContent`, `titleUpdated`) in closure scope
  - Handles all event types: `content`, `title`, `complete`, `error`
  - State persists across chunk callbacks without external state management

**Internal Handlers** (not exported):

- `handleContentChunk(set, chatId, aiMessageId, accumulatedContent)` - Updates streaming message content
- `handleTitleUpdate(set, chatId, title)` - Updates chat title and document title
- `handleStreamComplete(set, chatId, aiMessageId, finalContent)` - Finalizes streaming message
- `handleStreamErrorInternal(set, chatId, aiMessageId, errorMessage)` - Handles streaming errors

**Error Handler** (exported):

- [x] `handleStreamError(set, chatId, aiMessageId, errorMessage)` - Public wrapper for error handling in catch blocks

**Updated `chats.store.ts`**:

- [x] Added imports for streaming helpers
- [x] Refactored `sendMessage` to use helpers (lines 326-414)
  - Reduced from ~214 lines to ~77 lines
  - Message creation now uses pure functions
  - SSE handling uses `createStreamProcessor` with closure pattern
  - Error handling uses `handleStreamError` in catch block

### 📊 Phase 2 Results

**Files Modified**:

- `src/features/chat/stores/chats.store.ts` (~720 → ~520 lines, -200 lines)
- **NEW**: `src/features/chat/stores/streaming.ts` (+220 lines)

**sendMessage Function**:

- **Before**: ~214 lines (lines 320-534)
- **After**: ~77 lines (lines 326-414)
- **Reduction**: -137 lines (-64%)

**Architecture Decision: Closure Pattern**

The `createStreamProcessor` uses a closure pattern to encapsulate streaming state. This was chosen because:

1. **Stateful Processing**: SSE streaming requires accumulating content across multiple chunk callbacks
2. **State Persistence**: `accumulatedContent` and `titleUpdated` must persist across chunk calls
3. **Clean Encapsulation**: State is hidden from caller (no external state management needed)
4. **Per-Stream Isolation**: Each stream gets its own state instance (supports concurrent streams)
5. **No Store Pollution**: Transient streaming state doesn't belong in Zustand state

**Why not a simple function?**

```typescript
// ❌ Simple function - State doesn't persist between calls
export const processStreamEvent = (set, chatId, aiMessageId, chunk) => {
  // Where does accumulatedContent live?
  // This is called many times per stream - state would reset each time
};

// ✅ Closure - State persists across all chunks in one stream
export const createStreamProcessor = (set, chatId, aiMessageId) => {
  let accumulatedContent = ''; // Lives in closure
  let titleUpdated = false; // Lives in closure

  return chunk => {
    // Can access and modify accumulated state across all chunks
  };
};
```

**Benefits**:

- ✅ **Modularity**: Streaming logic is isolated in separate file
- ✅ **Testability**: Pure functions can be unit tested independently
- ✅ **Readability**: `sendMessage` is now much clearer with numbered steps (6 steps instead of 200+ lines)
- ✅ **Maintainability**: Changes to streaming logic don't affect main store
- ✅ **Reusability**: Helpers can be imported and used elsewhere
- ✅ **Type Safety**: All functions have proper TypeScript types
- ✅ **State Encapsulation**: Streaming state is hidden and automatically garbage collected

**Date Completed**: 2025-01-11

---

### Phase 2.5: Extract Draft Change Detection (Low Risk) ✅ COMPLETED

**Goal**: Complete the deferred Task 1.3 from Phase 1 - extract complex change detection logic into a testable pure function

#### Implementation ✅

**Created New File**: `src/features/chat/stores/draft-utils.ts` (~68 lines)

**Pure Functions**:

- [x] `detectDraftChanges(current, previous): DraftChanges` - Detects what changed in draft state
  - Returns structured object with individual change flags
  - Pure function - no side effects, fully testable
  - Handles all edge cases: null, undefined, array comparisons

**Updated `use-draft-autosave.ts`**:

- [x] Added import for `detectDraftChanges`
- [x] Replaced lines 62-76 (15 lines of complex logic) with single function call
- [x] Clearer intent with `changes.hasAnyChange` instead of computed boolean

#### 📊 Phase 2.5 Results

**Files Modified**:

- `src/features/chat/hooks/use-draft-autosave.ts` (132 → ~118 lines, -14 lines)
- **NEW**: `src/features/chat/stores/draft-utils.ts` (+68 lines)

**Change Detection Logic**:

- **Before**: 15 lines of nested conditionals inline
- **After**: 3 lines calling pure function
- **Reduction**: -12 lines (-80% in hook)

**Implementation Details**:

```typescript
// Before - Complex inline logic
const replyContextChanged =
  (replyContext === null || replyContext === undefined) !==
    (prev.replyContext === null || prev.replyContext === undefined) ||
  replyContext?.id !== prev.replyContext?.id ||
  replyContext?.content !== prev.replyContext?.content;

const hasChanged =
  content !== prev.content ||
  attachments.length !== prev.attachments.length ||
  attachments.some((att, i) => att.id !== prev.attachments[i]?.id) ||
  replyContextChanged;

// After - Clear, testable function call
const changes = detectDraftChanges(
  { content, attachments, replyContext },
  previousStateRef.current
);
const hasAnyChange = changes.hasAnyChange;
```

**Benefits**:

- ✅ **Testability**: Pure function can be unit tested in isolation
- ✅ **Readability**: Intent is clear from function name and return structure
- ✅ **Maintainability**: Change detection logic is centralized and documented
- ✅ **Reusability**: Can be imported and used in other components
- ✅ **Type Safety**: Structured return type with individual change flags
- ✅ **Low Risk**: No changes to hook's public API or behavior

**Date Completed**: 2025-01-11

---

### Phase 2.7: Extract Nested Chat Logic to Slice (Low Risk) ✅ COMPLETED

**Goal**: Separate nested chat/branching functionality into its own Zustand slice for better modularity

#### Implementation ✅

**Created New File**: `src/features/chat/stores/slices/chat-branches.slice.ts` (~174 lines)

**Slice Interface**:

- [x] `appendNewNestedChat(params)` - Creates new branch from a message with optimistic update
  - Returns tuple: `[ChatBranchContext, rollbackFunc]` for error handling
  - Generates random branch color
  - Supports full message and text selection contexts
- [x] `changeNestedChatConnectionType(...)` - Updates branch connection type (attached/detached/temporary)
  - Optimistic update with rollback on error
  - Persists to backend via `ChatMetadataService`

**Updated `chats.store.ts`**:

- [x] Added import for `createChatBranchesSlice` and `ChatBranchesSlice` type
- [x] Extended `ChatsStoreState` interface with `ChatBranchesSlice`
- [x] Merged slice into main store using spread operator: `...createChatBranchesSlice(...a)`
- [x] Removed duplicate implementations of both methods (~118 lines)

#### 📊 Phase 2.7 Results

**Files Modified**:

- `src/features/chat/stores/chats.store.ts` (~472 → ~472 lines, net zero due to slice import)
- **NEW**: `src/features/chat/stores/slices/chat-branches.slice.ts` (+174 lines)

**Branch Logic Extraction**:

- **Before**: 118 lines of nested chat logic embedded in main store (lines 421-539)
- **After**: Extracted to dedicated slice file
- **Reduction in main store**: -118 lines (moved to slice)

**Architecture Decision: Zustand Slice Pattern**

Used Zustand's official slice pattern with `StateCreator` for proper type composition:

```typescript
export interface ChatBranchesSlice {
  appendNewNestedChat: (args: {...}) => [ChatBranchContext, VoidFunction];
  changeNestedChatConnectionType: (...) => Promise<void>;
}

export const createChatBranchesSlice: StateCreator<
  ChatsStoreState,
  [],
  [],
  ChatBranchesSlice
> = (set, get) => ({
  // Implementation
});

// In main store
export const useChatsStore = create<ChatsStoreState>()(
  devtools(
    (...a) => {
      const [set, get] = a;
      return {
        ...createChatBranchesSlice(...a), // Merge slice
        // ... rest of store
      };
    }
  )
);
```

**Benefits**:

- ✅ **Modularity**: Nested chat logic is now in separate, focused file
- ✅ **Maintainability**: Changes to branching features are isolated
- ✅ **Readability**: Main store is cleaner without complex branching logic
- ✅ **Type Safety**: Full TypeScript support with proper slice typing
- ✅ **Zero Breaking Changes**: Public API remains identical
- ✅ **Pattern Established**: Can be used for future slice extractions (messages, drafts, etc.)

**Why Slice Pattern?**

The Zustand slice pattern was chosen because:

1. **Official Pattern**: Recommended by Zustand for large stores
2. **Type Composition**: `StateCreator` ensures proper TypeScript inference
3. **Access to Store**: Slices get full `set` and `get` access to entire store state
4. **Easy Integration**: Simple spread operator merges slice into main store
5. **Scalable**: Can extract more slices in future without major refactoring

**Date Completed**: 2025-01-11

---

### Phase 2.8: Reorganize Components into Hierarchical Structure (Low Risk) ✅ COMPLETED

**Goal**: Restructure component folders to reflect actual UI composition and parent-child relationships

#### Problem

Components were organized in a flat structure, making it difficult to understand relationships:

```
components/
├── branches/
├── chat-input/
├── messages/
├── quick-actions/
├── markdown/
└── ...
```

This made it unclear that:

- `branches` and `quick-actions` are children of `ai-message`
- `image-with-fallback` is a child of `user-message`
- `model-selector` and `image-upload-progress` are children of `chat-input`

#### Implementation ✅

**Reorganized Structure** (Hierarchical - Reflects Composition):

```
components/
├── messages/
│   ├── messages.tsx                          # Main container
│   ├── messages-skeleton.tsx
│   ├── selection-popup.tsx
│   └── components/
│       ├── ai-message/
│       │   ├── ai-message.tsx
│       │   └── components/
│       │       ├── typing-dots.tsx
│       │       ├── markdown.tsx              (renamed from react-markdown.tsx)
│       │       ├── branches/
│       │       │   ├── branches.tsx
│       │       │   └── branch-badge.tsx
│       │       └── quick-actions/
│       │           ├── quick-actions.tsx
│       │           └── quick-action-button.tsx
│       └── user-message/
│           ├── user-message.tsx
│           └── components/
│               ├── message-reply.tsx
│               └── image-with-fallback.tsx
│
├── chat-input/
│   ├── chat-input.tsx
│   └── components/
│       ├── message-reply.tsx                 (separate copy for input)
│       ├── model-selector.tsx
│       ├── image-upload-progress.tsx
│       └── global-file-drop-zone.tsx
│
├── file-view-modal/
│   └── file-view-modal.tsx
│
└── start-new-chat/
    └── start-new-chat.tsx
```

#### 📊 Phase 2.8 Results

**Files Moved**: 18 files reorganized
**Folders Created**: 6 new hierarchical folders
**Empty Folders Deleted**: 7 old folders removed

**Component Moves**:

1. **AI Message children** (8 files):
   - `typing-dots.tsx` → `messages/components/ai-message/components/`
   - `react-markdown.tsx` → `messages/components/ai-message/components/markdown.tsx`
   - `branches/` → `messages/components/ai-message/components/branches/`
   - `quick-actions/` → `messages/components/ai-message/components/quick-actions/`

2. **User Message children** (2 files):
   - `image-with-fallback.tsx` → `messages/components/user-message/components/`
   - `message-reply.tsx` (copy) → `messages/components/user-message/components/`

3. **Chat Input children** (4 files):
   - `model-selector.tsx` → `chat-input/components/`
   - `message-reply.tsx` → `chat-input/components/`
   - `image-upload-progress.tsx` → `chat-input/components/`
   - `global-file-drop-zone.tsx` → `chat-input/components/`

4. **Parent components** (3 files):
   - `ai-message.tsx` → `messages/components/ai-message/`
   - `user-message.tsx` → `messages/components/user-message/`
   - `selection-popup.tsx` → `messages/`

**Import Updates**: All imports updated across entire feature (~20 files)

**Example Import Change**:

```typescript
// Before
import Branches from '../branches/branches';
import ReactMarkdown from '../markdown/react-markdown';
import QuickActions from '../quick-actions/quick-actions';

// After
import Branches from './components/branches/branches';
import Markdown from './components/markdown';
import QuickActions from './components/quick-actions/quick-actions';
```

#### Benefits

- ✅ **Clear Ownership**: Each component folder contains its children
- ✅ **Better Navigation**: Related components grouped together
- ✅ **Matches Mental Model**: Structure reflects actual UI composition
- ✅ **Easier Onboarding**: New developers can understand component hierarchy at a glance
- ✅ **Scalability**: Easy to add more child components without cluttering root
- ✅ **Encapsulation**: Changes to ai-message children don't affect user-message

#### Design Decisions

1. **No Index Files**: Opted for direct imports (e.g., `./components/markdown.tsx`) instead of index files
   - Reason: Clearer IDE navigation, less boilerplate, no circular dependency risk
   - Children are only imported by their parent component

2. **message-reply.tsx Duplication**: Kept separate copies in user-message and chat-input
   - Reason: Used in different contexts with potentially different styling/behavior
   - Can be refactored to shared location later if needed

3. **markdown.tsx Rename**: Renamed from `react-markdown.tsx` to `markdown.tsx`
   - Reason: Simpler name (React is implied in React projects)

4. **Relative Path Imports**: Used relative paths for deeply nested components
   - Example: `../../../../../../../../actions/chat.actions`
   - Reason: No `@actions` path alias defined in tsconfig.json
   - Alternative: Could add path alias in future

**Date Completed**: 2025-01-11

---

### Phase 3: Architecture Improvements (High Risk - Optional) ⚠️

**Goal**: Improve long-term maintainability through better separation of concerns

#### Task 3.1: Evaluate Store Slicing

- [ ] Research Zustand slice patterns
- [ ] Create proof-of-concept with one slice (e.g., `draftSlice`)
- [ ] Evaluate benefits vs migration cost
- [ ] Decision: Proceed or defer

**Potential Slices**:

```typescript
// messagesSlice - CRUD operations
interface MessagesSlice {
  loadMessages: (chatId: string) => Promise<void>;
  loadMoreMessages: (chatId: string) => Promise<void>;
  addMessage: (chatId: string, message: ChatMessage) => void;
}

// streamingSlice - SSE handling
interface StreamingSlice {
  startStreaming: (chatId: string, messageId: string) => void;
  stopStreaming: (chatId: string) => void;
  handleStreamChunk: (chatId: string, chunk: SSEEvent) => void;
}

// draftSlice - draft management
interface DraftSlice {
  loadDraft: (chatId: string) => Promise<void>;
  saveDraft: (chatId: string, content: string) => Promise<void>;
  clearDraft: (chatId: string) => void;
}

// nestedChatsSlice - branching logic
interface NestedChatsSlice {
  appendNestedChat: (params) => void;
  changeConnectionType: (params) => Promise<void>;
}
```

#### Task 3.2: Message Adapter Layer

- [ ] Create `adapters/message.adapter.ts`
- [ ] Add `fromBackend(msg): ChatMessage` with validation
- [ ] Add `toBackend(msg): BackendMessage`
- [ ] Add runtime type guards
- [ ] Replace direct mapping with adapter

**Expected Outcome**: Better type safety, clearer data boundaries

---

## 💡 Quick Reference: Key Patterns

### State Update Pattern (Before → After)

```typescript
// ❌ Before: Repetitive and error-prone
set(state => ({
  chats: {
    ...state.chats,
    [chatId]: {
      ...state.chats[chatId],
      isStreaming: true,
      error: null,
    },
  },
}));

// ✅ After: Clear and concise
updateChatState(chatId, {
  isStreaming: true,
  error: null,
});
```

### Message Enrichment Pattern (Before → After)

```typescript
// ❌ Before: Duplicated in 3 places
const messages = response.messages.map(msg => ({
  ...msg,
  reply_content: null,
  nested_chats: [],
  attachments: [],
}));

// ✅ After: Single source of truth
const messages = response.messages.map(enrichMessage);
```

### Change Detection Pattern (Before → After)

```typescript
// ❌ Before: Complex inline logic
const hasChanged =
  content !== prev.content ||
  attachments.length !== prev.attachments.length ||
  attachments.some((att, i) => att.id !== prev.attachments[i]?.id) ||
  replyContext?.id !== prev.replyContext?.id ||
  replyContext?.content !== prev.replyContext?.content;

// ✅ After: Testable pure function
const changes = detectDraftChanges(current, previous);
if (changes.hasAnyChange) {
  // trigger save
}
```

## 🎨 Benefits Summary

| Benefit             | Phase 1 | Phase 2   | Phase 3 |
| ------------------- | ------- | --------- | ------- |
| **Readability**     | ✅✅✅  | ✅✅      | ✅      |
| **Maintainability** | ✅✅    | ✅✅✅    | ✅✅✅  |
| **Testability**     | ✅✅✅  | ✅✅      | ✅      |
| **Type Safety**     | ✅      | ✅        | ✅✅✅  |
| **Performance**     | -       | ✅        | ✅      |
| **Risk Level**      | 🟢 Low  | 🟡 Medium | 🔴 High |

## ⚠️ Implementation Guidelines

### Before Each Phase

1. **Create feature branch**: `refactor/chat-phase-X`
2. **Write tests**: For existing behavior
3. **Document**: Current behavior and edge cases

### During Implementation

1. **Small commits**: One task at a time
2. **Test continuously**: After each change
3. **Review code**: Self-review before pushing

### After Each Phase

1. **QA Testing**: Full regression test
2. **Performance check**: Monitor metrics
3. **Documentation**: Update if patterns changed

## 📝 Progress Tracking

### Phase 1 (Target: Week 1-2) ✅ COMPLETED

- [x] Task 1.1: State Update Helper
- [x] Task 1.2: Message Enrichment Helper
- [ ] Task 1.3: Draft Change Detection (Deferred to Phase 2)

### Phase 2 (Target: Week 3-4) ✅ COMPLETED

- [x] Extract streaming logic to separate file
- [x] Create optimistic message helpers
- [x] Create SSE stream handlers
- [x] Refactor `sendMessage` to use helpers

### Phase 2.5 (Week 4) ✅ COMPLETED

- [x] Task 1.3: Extract Draft Change Detection (Deferred from Phase 1)
- [x] Create `draft-utils.ts` with `detectDraftChanges` pure function
- [x] Update `use-draft-autosave.ts` to use helper

### Phase 2.7 (Week 4) ✅ COMPLETED

- [x] Create `slices/chat-branches.slice.ts` with branch logic
- [x] Extract `appendNewNestedChat` and `changeNestedChatConnectionType` to slice
- [x] Update main store to merge slice using Zustand slice pattern
- [x] Remove duplicate implementations from main store

### Phase 2.8 (Week 4) ✅ COMPLETED

- [x] Create hierarchical folder structure reflecting component composition
- [x] Move AI Message child components to nested folders
- [x] Move User Message child components to nested folders
- [x] Move Chat Input child components to nested folders
- [x] Update all import paths across the feature
- [x] Rename react-markdown.tsx to markdown.tsx
- [x] Delete empty folders
- [x] Verify TypeScript compilation

### Phase 3 (Target: TBD)

- [ ] Task 3.1: Evaluate Store Slicing (Partially Complete - Pattern Established in Phase 2.7)
- [ ] Task 3.2: Message Adapter Layer

---

## 🔗 Related Files

### Core Files to Refactor

- `stores/chats.store.ts` (808 lines) - Main target
- `hooks/use-draft-autosave.ts` (131 lines)
- `hooks/use-file-upload.ts` (156 lines)
- `hooks/use-draft-message-loader.ts` (50 lines)
- `components/chat-input/chat-input.tsx` (261 lines)

### Supporting Files

- `services/chats/chats-service.ts` - API client
- `types/chat-types.ts` - Type definitions
- `@shared-types/entities.ts` - Shared types

---

**Last Updated**: 2025-01-11
**Status**: Phase 2.8 Completed ✅ (Phases 1, 2, 2.5, 2.7, and 2.8 all done)
**Next Step**: Consider Phase 3 (High Risk - Optional) or move to other features
**Notes**:

- Phase 2.7 established the Zustand slice pattern, making future store splitting easier
- Phase 2.8 reorganized components to reflect UI composition hierarchy
