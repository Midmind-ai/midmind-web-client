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

### Phase 1: Extract Helper Functions (Low Risk) ✅

**Goal**: Reduce code duplication and improve readability with minimal risk

#### Task 1.1: Create State Update Helper

- [ ] Extract `updateChatState(chatId, updates)` helper
- [ ] Replace all repetitive state updates with helper
- [ ] Test: Ensure all chat operations still work

**Code Example**:

```typescript
const updateChatState = (chatId: string, updates: Partial<ChatState>) => {
  set(state => ({
    chats: {
      ...state.chats,
      [chatId]: {
        ...state.chats[chatId],
        ...updates,
      },
    },
  }));
};
```

#### Task 1.2: Create Message Enrichment Helper

- [ ] Create `enrichMessage(msg: BackendMessage): ChatMessage` function
- [ ] Replace duplication in `loadMessages`, `loadMoreMessages`, `loadDraftMessage`
- [ ] Test: Verify messages load correctly with all default fields

**Code Example**:

```typescript
const enrichMessage = (msg: BackendMessage): ChatMessage => ({
  ...msg,
  reply_content: msg.reply_content ?? null,
  nested_chats: msg.nested_chats ?? [],
  attachments: msg.attachments ?? [],
});
```

#### Task 1.3: Extract Draft Change Detection

- [ ] Create `detectDraftChanges(current, previous)` pure function
- [ ] Move logic from `useDraftAutoSave` hook lines 62-76
- [ ] Add unit tests for change detection
- [ ] Test: Verify auto-save triggers correctly

**Code Example**:

```typescript
const detectDraftChanges = (current: DraftState, previous: DraftState): DraftChanges => {
  const replyContextChanged =
    (current.replyContext === null || current.replyContext === undefined) !==
      (previous.replyContext === null || previous.replyContext === undefined) ||
    current.replyContext?.id !== previous.replyContext?.id ||
    current.replyContext?.content !== previous.replyContext?.content;

  const attachmentsChanged =
    current.attachments.length !== previous.attachments.length ||
    current.attachments.some((att, i) => att.id !== previous.attachments[i]?.id);

  return {
    contentChanged: current.content !== previous.content,
    attachmentsChanged,
    replyContextChanged,
    hasAnyChange:
      current.content !== previous.content || attachmentsChanged || replyContextChanged,
  };
};
```

**Expected Outcome**: ~150 lines reduced, clearer code, easier to test

---

### Phase 2: Split Large Functions (Medium Risk) 🔄

**Goal**: Break down complex functions into smaller, composable pieces

#### Task 2.1: Extract SSE Stream Handlers

- [ ] Create `handleContentChunk(chunk, messageId)`
- [ ] Create `handleTitleUpdate(chunk, chatId)`
- [ ] Create `handleStreamComplete(messageId)`
- [ ] Create `handleStreamError(chunk, messageId)`
- [ ] Refactor `sendMessage` to use these handlers
- [ ] Test: Verify streaming works correctly

**Location**: `chats.store.ts` lines 487-575 (switch statement)

#### Task 2.2: Extract Optimistic Message Creation

- [ ] Create `createOptimisticUserMessage(params): ChatMessage`
- [ ] Create `createOptimisticAIMessage(params): ChatMessage`
- [ ] Simplify `sendMessage` function
- [ ] Test: Verify messages appear immediately

**Location**: `chats.store.ts` lines 392-424

#### Task 2.3: Simplify Message Loading Flow

- [ ] Create `fetchAndEnrichMessages(chatId, offset, limit)`
- [ ] Create `mergeMessagesWithAttachments(messages, attachments)`
- [ ] Refactor `loadMessages` and `loadMoreMessages` to use helpers
- [ ] Test: Verify pagination and initial load work

**Expected Outcome**: `sendMessage` reduced from 220 to ~80 lines, easier to follow

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

### Phase 1 (Target: Week 1-2)

- [ ] Task 1.1: State Update Helper
- [ ] Task 1.2: Message Enrichment Helper
- [ ] Task 1.3: Draft Change Detection

### Phase 2 (Target: Week 3-4)

- [ ] Task 2.1: SSE Stream Handlers
- [ ] Task 2.2: Optimistic Message Creation
- [ ] Task 2.3: Simplify Message Loading

### Phase 3 (Target: TBD)

- [ ] Task 3.1: Evaluate Store Slicing
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
**Status**: Planning Phase
**Next Step**: Begin Phase 1, Task 1.1 (State Update Helper)
