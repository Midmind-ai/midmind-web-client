# Midmind Web Client - Project Guidelines

## 🛠️ Technology Stack

### Core Libraries
- **React / React DOM** - UI rendering and component logic
- **React Router** - Client-side routing and navigation

### State Management
- **Zustand** - Lightweight global state management store (prefer over Redux/Context API)

### API & Data Fetching
- **Axios** - HTTP client for API communication
- **SWR** - Remote data fetching and caching with revalidation
- **Socket.io Client** - Real-time WebSocket communication

### Styling
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Shadcn/UI** - Accessible, unstyled UI components built on Radix UI primitives

### Forms & Validation
- **React Hook Form** - Flexible and performant form management
- **Zod** - Schema-based form and data validation with TypeScript support

## 📁 Project Structure

The codebase follows a feature-based architecture with clear separation between application setup, shared resources, and individual features.

```
src/
├── app/                           # Global application logic
│   ├── providers/                 # App-wide providers (ThemeProvider, AuthProvider)
│   ├── routes/                    # Page components (Home.tsx, SignIn.tsx, Chat.tsx)
│   ├── app.tsx                    # Root component
│   ├── root-provider.tsx          # Top-level provider composition
│   └── router.tsx                 # Application routing configuration
│
├── assets/                        # Global assets (logo, fonts, icons)
├── components/                    # Global UI components (Button, Modal, Input)
│   └── ui/                        # Shadcn/UI components
├── config/                        # Library and global configurations
│   ├── api.ts                     # API settings (timeout, base URL, headers)
│   ├── axios.ts                   # Axios instances with interceptors
│   ├── swr.ts                     # SWR global configuration
│   ├── theme-colors.css           # Tailwind color scheme configuration
│   └── theme-fonts.css            # Font face definitions
├── constants/                     # Shared constants (cache keys, route names)
├── hooks/                         # Global hooks (useDebounce, useOutsideClick)
├── services/                      # API service layers (userService, authService)
├── stores/                        # Global Zustand stores (useUserStore, useThemeStore)
├── types/                         # Global TypeScript types (User, Role)
├── utils/                         # Utility functions (cn, formatDate)
│
└── features/                      # Feature-based modules
    ├── sign-in/
    │   ├── components/            # Feature-specific components
    │   │   └── sign-in-form/
    │   │       ├── sign-in-form.tsx       # Component implementation
    │   │       └── use-sign-in-form-logic.ts # Component logic hook
    │   ├── assets/                # Feature-specific assets
    │   ├── hooks/                 # Feature-specific hooks
    │   ├── stores/                # Feature-specific stores
    │   ├── types/                 # Feature-specific types
    │   └── utils/                 # Feature-specific utilities
    │
    └── chat/
        ├── components/
        │   └── messages/
        │       ├── messages.tsx
        │       └── use-messages-logic.ts
        ├── assets/
        ├── hooks/
        ├── stores/
        ├── types/
        └── utils/
```

## 🚨 Global Error Handling Architecture

### Centralized Error Handling via Axios Interceptors

All API errors are automatically caught and displayed as toast notifications through a global Axios interceptor:

- **Location**: `src/config/axios.ts` - Response interceptor catches all API errors
- **Error Handler**: `src/utils/error-handler.tsx` - Formats messages based on HTTP status
- **UI Component**: Sonner toast notifications - User-friendly error display

### How It Works

1. **Axios Interceptor** catches all API errors globally
2. **Error Handler** formats messages based on HTTP status codes (400, 401, 403, 404, 500)
3. **Sonner Toast** displays user-friendly error notifications
4. **SWR Rollback** automatically reverts optimistic updates via `rollbackOnError: true`

### Benefits

- ✅ **No manual error handling** needed in hooks - clean implementations
- ✅ **Consistent error messages** across the entire application
- ✅ **Automatic rollback** of optimistic updates on API failures
- ✅ **Clean hook implementations** without try-catch blocks
- ✅ **Centralized error formatting** based on HTTP status codes

## ⚙️ Configuration Architecture

### Centralized Configuration Management

All library configurations and global settings are centralized in the `src/config/` folder:

```typescript
src/config/
├── api.ts              # API settings (timeout, baseUrl, headers)
├── axios.ts            # Axios instances with auth interceptors  
├── swr.ts              # SWR global configuration
├── theme-colors.css    # Tailwind color scheme
└── theme-fonts.css     # Font face definitions

// Usage example - direct imports only:
import { apiConfig } from '@/config/api';
import { swrConfig } from '@/config/swr';
import { baseAxiosInstance } from '@/config/axios';
```

### Configuration vs Constants

- **Configurations** (`src/config/`): Settings that configure libraries or global behavior
- **Constants** (`src/constants/`): Static values like cache keys, route names, storage keys

## 🏗️ Service Layer Architecture

### Core Principle: One Service Per Entity

Each database entity has its own dedicated service class following the single responsibility principle:

```typescript
// ✅ Good: Dedicated service for each entity
src/services/
├── messages/
│   ├── messages-service.ts      # Messages only
│   └── messages-dtos.ts         # Message types
├── chats/
│   ├── chats-service.ts         # Chats only  
│   └── chats-dtos.ts            # Chat types
├── directories/
│   └── directories-service.ts   # Directories only
└── users/
    └── users-service.ts         # Users only

// ❌ Bad: Combined service handling multiple entities
src/services/
└── combined-service.ts          # Multiple HTTP clients in one service
```

## 🔄 Hooks Architecture

### Two-Layer Architecture with Explicit Separation

The hooks system uses a **strict two-layer approach** with clear boundaries:

```
src/features/[feature]/hooks/
├── data/                        # Layer 1: Pure SWR operations
│   ├── use-get-[entity].ts      # GET operations by cache key
│   ├── use-create-[entity].ts   # CREATE mutations by cache key
│   ├── use-update-[entity].ts   # UPDATE mutations by cache key
│   └── use-delete-[entity].ts   # DELETE mutations by cache key
└── logic/                       # Layer 2: Business logic operations
    ├── use-[entity]-actions.ts  # Business operations using data hooks
    └── use-[feature]-logic.ts   # Feature-specific business logic

src/hooks/
├── use-debounce.ts              # Shared utility hooks
├── use-url-params.ts            # Common functionality
└── cache-keys.ts                # Centralized cache key management
```

### Layer 1: Data Hooks (Pure SWR Operations)

**Purpose**: Direct mapping to service calls, no business logic
**Location**: `src/features/[feature]/hooks/data/`

```typescript
// src/features/chat/hooks/data/use-get-chats.ts
import useSWR from 'swr';
import { ChatsService } from '@/services/chats/chats-service';
import { SWRCacheKeys } from '@/constants/swr-cache-keys';

// ✅ Pure data fetching - no business logic
export function useGetChats(parentDirectoryId?: string) {
  return useSWR(
    SWRCacheKeys.GetChats(parentDirectoryId),
    () => ChatsService.getChats({ parentDirectoryId }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
}

export function useGetChatById(id: string | null | undefined) {
  return useSWR(
    id ? SWRCacheKeys.GetChatById(id) : null,
    id ? () => ChatsService.getChatById(id) : null
  );
}
```

```typescript
// src/features/chat/hooks/data/use-create-chat.ts
import { useSWRMutation } from 'swr/mutation';
import { ChatsService } from '@/services/chats/chats-service';
import { SWRCacheKeys } from '@/constants/swr-cache-keys';

// ✅ Pure mutation - no business logic, just cache invalidation
export function useCreateChat() {
  return useSWRMutation(
    SWRCacheKeys.CreateChat(),
    async (_, { arg }: { arg: CreateChatDto }) => {
      const result = await ChatsService.createChat(arg);
      // Only handle cache invalidation here
      return result;
    }
  );
}
```

### Layer 2: Business Logic Hooks

**Purpose**: Add business value, orchestrate data hooks, handle complex workflows
**Location**: `src/features/[feature]/hooks/logic/`

```typescript
// src/features/chat/hooks/logic/use-chat-actions.ts
import { useNavigate } from 'react-router';
import { AppRoutes, SearchParams } from '@/constants/router';
import { useUrlParams } from '@/hooks/use-url-params';
import { useCreateChat } from '../data/use-create-chat';
import { useDeleteChat } from '../data/use-delete-chat';

// ✅ Business logic that orchestrates data hooks
export const useChatActions = () => {
  const navigate = useNavigate();
  const { setValue: setSplitChatId } = useUrlParams(SearchParams.Split);
  const { trigger: createChat } = useCreateChat();
  const { trigger: deleteChat } = useDeleteChat();

  const openChatInNewTab = (chatId: string) => {
    window.open(AppRoutes.Chat(chatId), '_blank');
  };

  const openChatInSidePanel = (chatId: string) => {
    setSplitChatId(chatId);
  };

  const navigateToChat = (chatId: string) => {
    navigate(AppRoutes.Chat(chatId));
  };

  // ✅ Complex business workflow using data hooks
  const createAndNavigateToChat = async (name: string, parentDirectoryId?: string) => {
    try {
      const newChat = await createChat({ name, parentDirectoryId });
      navigateToChat(newChat.id);
      return newChat;
    } catch (error) {
      console.error('Failed to create chat:', error);
      throw error;
    }
  };

  const deleteAndRedirect = async (chatId: string) => {
    await deleteChat(chatId);
    navigate(AppRoutes.Home);
  };

  return {
    // Simple actions
    openChatInNewTab,
    openChatInSidePanel,
    navigateToChat,
    // Complex business workflows
    createAndNavigateToChat,
    deleteAndRedirect,
  };
};
```

### Strict Layer Boundaries

**❌ Data hooks MUST NOT contain:**
- Navigation logic
- Complex business workflows
- UI state management
- Feature-specific logic

**❌ Business logic hooks MUST NOT contain:**
- Direct SWR calls
- Service calls
- Cache key definitions

**✅ Data hooks SHOULD only:**
- Call services
- Handle cache keys
- Return raw SWR responses
- Manage loading/error states from SWR

**✅ Business logic hooks SHOULD:**
- Import and use data hooks
- Orchestrate multiple operations
- Handle navigation and routing
- Manage complex workflows
- Add business-specific transformations

## 🔄 SWR Mutations Best Practices

### ✅ Recommended Pattern: Direct Mutate with Global Error Handling

For ALL operations that modify server state (CREATE, UPDATE, DELETE, MOVE), use the direct `mutate()` pattern with optimistic updates. Errors are handled globally via Axios interceptors, eliminating the need for try-catch blocks.

**This is the canonical pattern for all mutations:**

**Example 1: Delete Operation**
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
        populateCache: true,   // Use the returned data as new cache
        revalidate: false,     // Don't revalidate since we return the data
      }
    );
  };

  return { deleteDirectory };
};
```

**Example 2: Create Operation**
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
          parent_id: parentId 
        });
        
        // Return updated data with new item
        if (!current) return [created];
        return [...current, created];
      },
      {
        optimisticData: (current?: Directory[]): Directory[] => {
          // Immediate optimistic update - add to UI
          const optimisticDir = { id: newId, name, parent_id: parentId, created_at: new Date() };
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

**Example 3: Update Operation**
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
        return current.map(dir => 
          dir.id === id ? { ...dir, ...updates } : dir
        );
      },
      {
        optimisticData: (current?: Directory[]): Directory[] => {
          // Immediate optimistic update - update in UI
          if (!current) return [];
          return current.map(dir => 
            dir.id === id ? { ...dir, ...updates } : dir
          );
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

### Error Handling Flow

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

### When to Use This Pattern

**Use the Direct Mutate Pattern for:**
- ✅ **All CRUD operations**: CREATE, UPDATE, DELETE
- ✅ **Move/reorder operations**: Changing parent relationships  
- ✅ **Batch operations**: Multiple cache updates
- ✅ **Any mutation**: Where you want automatic error toasts and rollback

### Why This Pattern is Superior

**1. Automatic Error Handling**
- Axios interceptor catches all API errors globally
- No try-catch blocks needed in hooks
- Consistent error messages based on HTTP status codes

**2. Automatic Rollback**
- `rollbackOnError: true` works seamlessly with global error handling
- If API fails, optimistic updates are automatically reverted
- UI always stays in sync with server state

**3. Clean Implementation**
- No error handling boilerplate
- Focus on business logic, not error management
- Consistent pattern across all mutations

**4. Centralized Configuration**
```typescript
// src/config/swr.ts
export const swrMutationConfig = {
  rollbackOnError: true,    // Auto-rollback on API errors
  throwOnError: false,      // Errors via .error instead of throwing
} as const;
```

**5. User-Friendly Feedback**
- Immediate optimistic updates for better UX
- Automatic error toasts via Sonner
- Clear error messages for different scenarios

### Implementation Checklist

✅ **Axios Interceptor** configured in `src/config/axios.ts`
✅ **Error Handler** implemented in `src/utils/error-handler.tsx`
✅ **Sonner Toaster** added to root provider
✅ **Direct Mutate Pattern** used consistently across all mutations

### Critical Rules for This Pattern

**✅ CORRECT: No try-catch needed with global error handling**
```typescript
await mutate(
  cacheKey,
  async (current) => {
    await APIService.call(); // Errors caught by Axios interceptor
    return updatedData;
  },
  { 
    optimisticData: optimisticUpdate,
    rollbackOnError: true  // Works with global error handling
  }
);
```

**❌ INCORRECT: Manual try-catch is redundant**
```typescript
try {
  await mutate(/* ... */);
} catch (error) {
  // Don't do this - Axios already handles errors globally
  handleError(error);
}
```

### ✅ Always Use Centralized Cache Keys

Never use hardcoded strings for mutation keys. Always import from the centralized `cache-keys.ts`:

**✅ Correct:**
```typescript
import { MUTATION_KEYS, CACHE_KEYS } from '@hooks/cache-keys';

// Use centralized mutation keys
useSWRMutation(MUTATION_KEYS.directories.move, mutationFn)
useSWRMutation(MUTATION_KEYS.chats.create, mutationFn)

// Use centralized cache keys
CACHE_KEYS.directories.withParent(parentId)
CACHE_KEYS.chats.details(chatId)
```

**❌ Wrong:**
```typescript
// ❌ Hardcoded strings - hard to maintain and refactor
useSWRMutation('move-directory', mutationFn)
useSWRMutation('create-chat', mutationFn)

// ❌ Inconsistent cache key patterns
['directories', parentId]
['chat-details', chatId]
```

**Benefits of Centralized Keys:**
- **Type Safety**: TypeScript catches typos and missing keys
- **Consistency**: All mutation keys follow the same pattern
- **Maintainability**: Easy to update keys across the entire codebase
- **Discoverability**: Developers can see all available keys in one place
- **Refactoring**: IDE can safely rename and find all usages

## 🎨 Component Style Guide

All components MUST follow this consistent pattern:

```tsx
type Props = {
  someProp: string;
  onAction: VoidFunction;
};

const MyComponent = ({ someProp, onAction }: Props) => {
  const { data, isLoading } = useMyComponentLogic();

  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  );
};

export default MyComponent;
```

### Component Logic Separation
- Extract complex logic into custom hooks named `use[ComponentName]Logic.ts`
- Keep components focused on rendering UI
- Place business logic and side effects in the custom hook

## 🏷️ Naming Conventions

### Variables, Functions & Hooks
- **Variables & Functions**: Use `camelCase`
  - Examples: `isPasswordVisible`, `getUserData`, `handleSubmit`
- **Custom Hooks**: Use `camelCase` starting with `use`
  - Examples: `useSignInLogic`, `useMessages`, `useDebounce`

### Types & Interfaces
- **Types & Interfaces**: Use `PascalCase`
  - Examples: `User`, `ChatMessage`, `AuthState`
- **API Types**: Follow `VerbNounRequest/Response` pattern
  - Example: For `getCurrentUser()` → `GetCurrentUserRequest`, `GetCurrentUserResponse`
- **Props Types**: Always name component props type as `Props`

### Files & Folders
- **Component Folders**: Use `PascalCase`
  - Examples: `UserCard/`, `ChatHeader/`, `SignInForm/`
- **General Folders**: Use `kebab-case`
  - Examples: `api-client/`, `form-utils/`
- **Utility Files**: Use `camelCase`
  - Examples: `localStorage.ts`, `timeHelpers.ts`, `formatters.ts`
- **Component Files**: Use `PascalCase.tsx`
  - Examples: `SignInForm.tsx`, `ChatMessage.tsx`
- **Hook Files**: Use `camelCase.ts`
  - Examples: `useSignInLogic.ts`, `useMessagesLogic.ts`

## 📝 Development Guidelines

### State Management
- Use **Zustand** for global state management
- Keep stores focused and domain-specific
- Prefer multiple small stores over one large store

### API Integration
- Use **Axios** instances with interceptors for consistent API handling
- Implement API services in `shared/services/`
- Use **SWR** for server state management and caching

### Styling
- Use **Tailwind CSS** utilities for all styling
- Avoid custom CSS files unless absolutely necessary
- Use `cn()` utility for conditional class names
- Follow mobile-first responsive design

### Forms
- Use **React Hook Form** for all forms
- Validate with **Zod** schemas
- Keep validation schemas close to where they're used

### TypeScript
- Always use TypeScript, avoid `any` type
- Define explicit types for all props, state, and function returns
- Use type inference where appropriate
- Export types that might be reused

### Error Handling
- Implement proper error boundaries
- Use try-catch blocks in async operations
- Provide user-friendly error messages
- Log errors appropriately for debugging

### Testing
- Write tests for critical business logic
- Test custom hooks separately
- Focus on user interactions and outcomes

## 🚀 Best Practices

1. **Keep components small and focused** - Single responsibility principle
2. **Extract reusable logic into hooks** - DRY principle
3. **Use semantic HTML elements** - Improve accessibility
4. **Implement proper loading and error states** - Better UX
5. **Optimize re-renders** - Use React.memo, useMemo, useCallback appropriately
6. **Follow consistent code formatting** - Use Prettier and ESLint
7. **Document complex logic** - Add comments only when necessary
8. **Use TypeScript strictly** - Enable strict mode
9. **Implement responsive design** - Mobile-first approach
10. **Keep dependencies up to date** - Regular maintenance

## 📦 Package Manager

This project uses **Yarn** as the package manager. 
- Always use `yarn` commands, never `npm`
- Commit `yarn.lock` file
- Never commit `package-lock.json`

## 🔧 Development Commands

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn lint         # Run ESLint
yarn types:check  # Check TypeScript types
yarn format       # Format code with Prettier
```

## ⚠️ Important Notes

- Node.js version required: **>=20.0.0**
- Always use Yarn for package management
- Follow the established patterns and conventions
- When in doubt, look at existing code for examples
- Maintain consistency across the codebase