# Hooks Architecture & Patterns

## Core Principles

### 1. Two-Layer Architecture

All hooks follow a strict two-layer architecture:

- **Layer 1: Data Hooks** (`/hooks/data/`) - Pure SWR operations, no business logic
- **Layer 2: Logic Hooks** (`/hooks/logic/`) - Business logic that orchestrates data hooks

### 2. When to Use Each Approach

#### Use `useSWRMutation` when:

- Multiple components need to share the same loading/error state
- You need request deduplication (preventing duplicate API calls)
- Simple cache updates are sufficient
- You want standardized error handling across the app

#### Use Direct Service Calls when:

- Only one component needs the loading state
- You need complex optimistic updates across multiple cache keys
- Performance is critical (avoiding extra abstraction layers)
- You want full control over the execution flow

## Mutation Patterns

### Pattern 1: Direct Service Call with Optimistic Updates (Preferred for Complex Operations)

```typescript
import { produce } from 'immer';
import { mutate } from 'swr';

export const useRenameDirectory = () => {
  const renameDirectory = async ({ id, name }: RenameDirectoryParams) => {
    try {
      // IMPORTANT: Optimistic update MUST be inside try-catch for rollback to work
      await mutate(
        invalidateCachePattern(['directories']),
        produce((draft?: Directory[]) => {
          if (!draft) {
            return draft;
          }

          const directoryIndex = draft.findIndex(dir => dir.id === id);
          if (directoryIndex !== -1) {
            draft[directoryIndex].name = name;
          }

          return draft;
        }),
        {
          revalidate: false,
          rollbackOnError: true, // Only works if mutate is inside try-catch
        }
      );

      // Make API call to update on server
      await DirectoriesService.updateDirectory(id, { name });
    } catch (error) {
      // If API fails, optimistic update will be rolled back automatically
      console.error('Failed to rename directory:', error);
      throw error;
    }
  };

  return { renameDirectory };
};
```

### Pattern 2: useSWRMutation (For Shared State Scenarios)

```typescript
import useSWRMutation from 'swr/mutation';

export const useRenameChat = () => {
  const { mutate } = useSWRConfig();

  // Multiple components can access this loading state
  const {
    trigger,
    isMutating: isLoading,
    error,
  } = useSWRMutation(
    MUTATION_KEYS.chats.updateDetails,
    async (_key: string, { arg }: { arg: { id: string; name: string } }) => {
      return ChatsService.updateChatDetails(arg.id, { name: arg.name });
    }
  );

  const renameChat = async (id: string, name: string) => {
    await trigger(
      { id, name },
      {
        onSuccess: () => {
          // Update cache after success
          mutate(CACHE_KEYS.chats.details(id), { name, id }, false);
          mutate(invalidateCachePattern(['chats']));
        },
      }
    );
  };

  return { renameChat, isLoading, error };
};
```

## Cache Management Patterns

### Pattern 1: Update Multiple Caches with invalidateCachePattern

```typescript
// This updates ALL cache keys that start with ['directories']
// - ['directories'] - root directories
// - ['directories', 'folder-id-1'] - directories in folder 1
// - ['directories', 'folder-id-2'] - directories in folder 2
await mutate(
  invalidateCachePattern(['directories']),
  produce((draft?: Directory[]) => {
    // This function runs on EVERY matching cache
    if (!draft) return draft;

    // Find and update the item in each cache
    const index = draft.findIndex(dir => dir.id === targetId);
    if (index !== -1) {
      draft[index].someProperty = newValue;
    }
  }),
  { revalidate: false }
);
```

### Pattern 2: Update Specific Cache Key

```typescript
// Updates only the specific cache for a parent directory
const cacheKey = CACHE_KEYS.directories.withParent(parentDirectoryId);
await mutate(
  cacheKey,
  produce((draft?: Directory[]) => {
    if (!draft) return draft;
    // Modify the specific cache
    draft.unshift(newDirectory);
  }),
  { revalidate: false }
);
```

## Critical Rules for Optimistic Updates

### ✅ CORRECT: Optimistic update inside try-catch

```typescript
try {
  await mutate(key, optimisticData, { rollbackOnError: true });
  await apiCall();
} catch (error) {
  // Rollback happens automatically
  throw error;
}
```

### ❌ INCORRECT: Optimistic update outside try-catch

```typescript
await mutate(key, optimisticData, { rollbackOnError: true });
try {
  await apiCall();
} catch (error) {
  // Rollback WON'T happen!
  throw error;
}
```

## Decision Tree for Hook Implementation

1. **Do multiple components need the same loading state?**
   - Yes → Use `useSWRMutation`
   - No → Continue to #2

2. **Do you need complex optimistic updates across multiple caches?**
   - Yes → Use direct service calls
   - No → Continue to #3

3. **Is this a simple CRUD operation?**
   - Yes → Use direct service calls (simpler)
   - No → Use `useSWRMutation` (more features)

## Common Patterns to Follow

### Create Operations

- Generate client-side ID first (using uuid)
- Add optimistically to cache
- Send to server with the pre-generated ID
- Update parent's `has_children` flag if applicable

### Rename/Update Operations

- Always wrap optimistic update and API call in the same try-catch
- Use `rollbackOnError: true` for automatic rollback
- Update all relevant caches using `invalidateCachePattern`

### Delete Operations

- Remove from cache optimistically
- Call delete API
- Clean up any related caches

## Type Safety for Cache Updates

Always check if draft exists before operating on it:

```typescript
produce((draft?: SomeType[]) => {
  if (!draft) {
    return draft; // Return undefined as-is
  }
  // Now TypeScript knows draft is SomeType[]
  // Safe to use array methods
});
```

This prevents runtime errors when caches haven't been populated yet.
