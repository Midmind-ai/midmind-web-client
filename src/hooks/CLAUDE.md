# Hooks Architecture & Patterns

## Core Principles

### 1. Two-Layer Architecture

All hooks follow a strict two-layer architecture:

- **Layer 1: Data Hooks** (`/hooks/data/`) - Pure SWR operations, no business logic
- **Layer 2: Logic Hooks** (`/hooks/logic/`) - Business logic that orchestrates data hooks

### 2. Global Error Handling

With Axios interceptors handling all API errors globally:

- **No try-catch blocks needed** in mutation hooks
- **Automatic error toasts** via Sonner
- **Automatic rollback** of optimistic updates on API failures

## The Recommended Mutation Pattern

### Direct Mutate with Optimistic Updates (For Single Cache Entry Mutations)

This pattern works for CREATE, UPDATE, DELETE, MOVE, and any other mutation operations. Errors are handled globally by Axios interceptors, so no try-catch blocks are needed.

#### Example 1: Delete Operation

```typescript
export const useDeleteDirectory = () => {
  const { mutate } = useSWRConfig();

  const deleteDirectory = async (id: string, parentDirectoryId?: string) => {
    const cacheKey = CACHE_KEYS.directories.withParent(parentDirectoryId);

    await mutate(
      cacheKey,
      async (current?: Directory[]): Promise<Directory[]> => {
        // API call - errors handled by Axios interceptor globally
        await DirectoriesService.deleteDirectory(id);

        // Clean up related caches after successful deletion
        await mutate(findCacheKeysByPattern(['directories', id]), undefined);
        await mutate(findCacheKeysByPattern(['chats', 'directories', id]), undefined);

        // Return updated data (without the deleted item)
        if (!current) return [];
        return current.filter(item => item.id !== id);
      },
      {
        optimisticData: (current?: Directory[]): Directory[] => {
          // Immediate optimistic update - remove from UI
          if (!current) return [];
          return current.filter(item => item.id !== id);
        },
        rollbackOnError: true, // ✅ Automatic rollback on API error
        populateCache: true, // Use the returned data as new cache
        revalidate: false, // Don't revalidate since we return the data
      }
    );
  };

  return { deleteDirectory };
};
```

#### Example 2: Create Operation

```typescript
export const useCreateDirectory = () => {
  const { mutate } = useSWRConfig();

  const createDirectory = async (name: string, parentId?: string) => {
    const cacheKey = CACHE_KEYS.directories.withParent(parentId);
    const newId = uuid(); // Generate ID client-side for optimistic update

    await mutate(
      cacheKey,
      async (current?: Directory[]): Promise<Directory[]> => {
        // API call - errors handled by Axios interceptor globally
        const created = await DirectoriesService.createDirectory({
          id: newId,
          name,
          parent_id: parentId,
        });

        // Return updated data with new item
        if (!current) return [created];
        return [...current, created];
      },
      {
        optimisticData: (current?: Directory[]): Directory[] => {
          // Immediate optimistic update - add to UI
          const optimisticDir = {
            id: newId,
            name,
            parent_id: parentId,
            created_at: new Date().toISOString(),
          };
          if (!current) return [optimisticDir];
          return [...current, optimisticDir];
        },
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  return { createDirectory };
};
```

#### Example 3: Update Operation

```typescript
export const useUpdateDirectory = () => {
  const { mutate } = useSWRConfig();

  const updateDirectory = async (id: string, updates: Partial<Directory>) => {
    // Update all caches that contain this directory
    await mutate(
      findCacheKeysByPattern(['directories']),
      async (current?: Directory[]): Promise<Directory[]> => {
        // API call - errors handled by Axios interceptor globally
        await DirectoriesService.updateDirectory(id, updates);

        // Return updated data
        if (!current) return [];
        return current.map(dir => (dir.id === id ? { ...dir, ...updates } : dir));
      },
      {
        optimisticData: (current?: Directory[]): Directory[] => {
          // Immediate optimistic update - update in UI
          if (!current) return [];
          return current.map(dir => (dir.id === id ? { ...dir, ...updates } : dir));
        },
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  return { updateDirectory };
};
```

### Key Benefits of This Pattern

1. **Consistent Across All Operations**: Same pattern for CREATE, UPDATE, DELETE, MOVE
2. **No Try-Catch Needed**: Axios interceptor handles all errors globally
3. **Automatic Error Toasts**: User-friendly notifications via Sonner
4. **Optimistic UI Updates**: Immediate feedback to users
5. **Automatic Rollback**: On API failure, UI reverts to previous state
6. **Clean Code**: No error handling boilerplate in hooks

### Manual Optimistic Updates (For Multi-Cache Entry Mutations)

When a mutation affects **multiple cache entries simultaneously** (like moving items between containers), the built-in `optimisticData` approach becomes complex and error-prone. In these cases, we use **manual optimistic updates** with explicit rollback handling.

**Use this approach when:**

- Moving items between different parent containers
- Operations that affect both source and destination caches
- Complex mutations that require coordinated updates across multiple cache keys

#### Example: Move Chat Between Directories

```typescript
export const useMoveChat = () => {
  const { mutate, cache } = useSWRConfig();

  const moveChat = async ({
    chatId,
    sourceParentDirectoryId,
    sourceParentChatId,
    targetParentDirectoryId,
  }: MoveChatParams) => {
    // Get cache keys for both source and destination
    const sourceCacheKey = CACHE_KEYS.chats.byParentId(
      sourceParentDirectoryId,
      sourceParentChatId
    );
    const targetCacheKey = CACHE_KEYS.chats.byParentId(targetParentDirectoryId);

    // Get current cache data for both locations
    const sourceCacheState = cache.get(unstable_serialize(sourceCacheKey));
    const targetCacheState = cache.get(unstable_serialize(targetCacheKey));

    const sourceCacheData = sourceCacheState?.data;
    const targetCacheData = targetCacheState?.data;

    const movedChat = sourceCacheData?.find((chat: Chat) => chat.id === chatId);

    if (!movedChat) {
      throw new Error('Chat not found in cache');
    }

    // Create updated chat object with new parent
    const updatedChat = {
      ...movedChat,
      parent_directory_id: targetParentDirectoryId,
    };

    // STEP 1: Apply optimistic updates immediately to both caches
    const updatedSourceCache =
      sourceCacheData?.filter((chat: Chat) => chat.id !== chatId) || [];
    const updatedTargetCache = targetCacheData
      ? [updatedChat, ...targetCacheData]
      : [updatedChat];

    // Update both caches optimistically (no revalidation)
    await mutate(sourceCacheKey, updatedSourceCache, { revalidate: false });
    await mutate(targetCacheKey, updatedTargetCache, { revalidate: false });

    try {
      // STEP 2: Make API call
      await ChatsService.updateChatDetails(chatId, {
        name: movedChat.name,
        directory_id: targetParentDirectoryId,
      });
    } catch (error) {
      // STEP 3: Manual rollback on error - restore original cache states
      await mutate(sourceCacheKey, sourceCacheData, { revalidate: false });
      await mutate(targetCacheKey, targetCacheData, { revalidate: false });

      // Re-throw error so it gets handled by global error handler
      throw error;
    }
  };

  return { moveChat };
};
```

#### Key Differences from Single-Cache Pattern

1. **Manual Cache Management**: Use `cache.get()` to retrieve current state before mutations
2. **Explicit Optimistic Updates**: Apply changes to multiple caches using separate `mutate()` calls
3. **Manual Rollback**: Restore original cache states in try-catch block
4. **No `optimisticData` Prop**: Avoid SWR's built-in optimistic updates for complex scenarios
5. **Coordinated Updates**: Ensure all related caches are updated atomically

#### When to Use Manual vs Automatic Optimistic Updates

**Use Automatic (`optimisticData` prop):**

- ✅ Single cache entry affected
- ✅ Simple ADD/REMOVE/UPDATE operations
- ✅ Standard CRUD operations

**Use Manual Optimistic Updates:**

- ✅ Multiple cache entries affected simultaneously
- ✅ Move operations between containers
- ✅ Complex state transitions requiring coordination
- ✅ When `optimisticData` callback becomes too complex

#### Benefits of Manual Approach

1. **Full Control**: Complete control over cache updates and rollback logic
2. **Atomic Operations**: Ensure multiple caches are updated together
3. **Clear Rollback**: Explicit error handling with original state restoration
4. **Performance**: Immediate UI updates without waiting for server response
5. **Consistency**: Maintain data integrity across related cache entries

## Cache Management Patterns

### Pattern 1: Update Multiple Caches with findCacheKeysByPattern

```typescript
// This updates ALL cache keys that start with ['directories']
// - ['directories'] - root directories
// - ['directories', 'folder-id-1'] - directories in folder 1
// - ['directories', 'folder-id-2'] - directories in folder 2
await mutate(
  findCacheKeysByPattern(['directories']),
  async (current?: Directory[]): Promise<Directory[]> => {
    // API call here
    await DirectoriesService.updateDirectory(id, updates);

    // This function runs on EVERY matching cache
    if (!current) return [];

    // Find and update the item in each cache
    return current.map(dir =>
      dir.id === targetId ? { ...dir, ...updates } : dir
    );
  },
  {
    optimisticData: /* same update logic */,
    rollbackOnError: true,
    populateCache: true,
    revalidate: false
  }
);
```

### Pattern 2: Update Specific Cache Key

```typescript
// Updates only the specific cache for a parent directory
const cacheKey = CACHE_KEYS.directories.withParent(parentDirectoryId);
await mutate(
  cacheKey,
  async (current?: Directory[]): Promise<Directory[]> => {
    // API call here
    const newItem = await DirectoriesService.createDirectory(data);

    // Modify the specific cache
    if (!current) return [newItem];
    return [...current, newItem];
  },
  {
    optimisticData: /* same logic */,
    rollbackOnError: true,
    populateCache: true,
    revalidate: false
  }
);
```

## Critical Rules for Mutations with Global Error Handling

### ✅ The New Standard: No Try-Catch Needed

With global error handling via Axios interceptors, you DON'T need try-catch blocks:

```typescript
// ✅ CORRECT: Let Axios interceptor handle errors
await mutate(
  cacheKey,
  async current => {
    await APIService.call(); // Errors caught by Axios interceptor
    return updatedData;
  },
  {
    optimisticData: optimisticUpdate,
    rollbackOnError: true, // Still works with global error handling
  }
);
```

### ❌ INCORRECT: Manual try-catch is redundant

```typescript
// ❌ Don't do this - Axios already handles errors globally
try {
  await mutate(
    cacheKey,
    async current => {
      await APIService.call();
      return updatedData;
    },
    { rollbackOnError: true }
  );
} catch (error) {
  // This is redundant - error is already handled globally
  handleError(error);
}
```

### When This Pattern Works Best

- ✅ **All CRUD operations**: CREATE, UPDATE, DELETE
- ✅ **Move/reorder operations**: Changing parent relationships
- ✅ **Batch operations**: Multiple cache updates
- ✅ **Any mutation**: Where you want automatic error toasts

## Error Flow Diagram

```
User Action
    ↓
Hook Called (e.g., deleteDirectory)
    ↓
Optimistic Update Applied (immediate UI feedback)
    ↓
API Call via Service
    ↓
[Success Path]              [Error Path]
    ↓                           ↓
Cache Updated            Axios Interceptor Catches
    ↓                           ↓
UI Stays Updated         Error Handler Called
                               ↓
                         Sonner Toast Shown
                               ↓
                         SWR Rollback Triggered
                               ↓
                         UI Reverts to Previous State
```

## Decision Tree for Hook Implementation

1. **Do you need to modify server state?**
   - Yes → Use the Direct Mutate Pattern
   - No → Use regular `useSWR` for data fetching

2. **Do you need optimistic updates?**
   - Yes → Include `optimisticData` option
   - No → Skip `optimisticData`, just use the async function

3. **Do you need to update multiple caches?**
   - Yes → Use `findCacheKeysByPattern`
   - No → Use specific cache key

## Common Patterns to Follow

### Create Operations

- Generate client-side ID first (using uuid)
- Add optimistically to cache
- Send to server with the pre-generated ID
- Update parent's `has_children` flag if applicable

### Update Operations

- Update all relevant caches using `findCacheKeysByPattern`
- Apply optimistic updates immediately
- Let Axios handle any errors globally

### Delete Operations

- Remove from cache optimistically
- Call delete API
- Clean up any related caches

### Move Operations

- Remove from source cache optimistically
- Add to destination cache optimistically
- Call move API
- Both caches rollback on error

## Type Safety for Cache Updates

Always check if draft exists before operating on it:

```typescript
async (current?: SomeType[]): Promise<SomeType[]> => {
  if (!current) {
    return []; // or return appropriate default
  }
  // Now TypeScript knows current is SomeType[]
  // Safe to use array methods
  return current.filter(/* ... */);
};
```

This prevents runtime errors when caches haven't been populated yet.

## Summary

The Direct Mutate Pattern with Global Error Handling is the recommended approach for ALL mutation operations in this codebase. It provides:

- **Consistency**: Same pattern everywhere
- **Simplicity**: No error handling boilerplate
- **Reliability**: Automatic rollback on failures
- **User Experience**: Immediate feedback and clear error messages

Always follow this pattern for mutations unless you have a specific requirement that necessitates a different approach.
