# Midmind Web Client - Project Guidelines

## 🛠️ Technology Stack

### Core Libraries

- **React / React DOM** - UI rendering and component logic
- **React Router** - Client-side routing and navigation

### State Management

- **Zustand** - Lightweight global state management store (prefer over Redux/Context API)

### API & Data Fetching

- **Axios** - HTTP client for API communication
- **SWR** - Remote data fetching and caching with revalidation (use only for simple, read-only data that doesn't require complex state management or optimistic updates - most data should be managed through Zustand stores)
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
    ├── file-system/
    │   ├── components/            # UI components
    │   │   ├── tree-node/
    │   │   ├── tree-dnd/
    │   │   └── folder-list/
    │   ├── hooks/                 # Action hooks and utilities
    │   │   ├── use-file-system-actions.ts
    │   │   └── use-tree-dnd-logic.ts
    │   ├── stores/                # Zustand stores (handle data loading)
    │   │   ├── file-system.store.ts
    │   │   ├── expanded-nodes.store.ts
    │   │   └── inline-edit.store.ts
    │   └── data/                  # Data utilities (optional)
    │       └── use-load-data.ts
    │
    └── chat/
        ├── components/
        │   └── messages/
        │       ├── messages.tsx
        │       └── use-messages-logic.ts
        ├── hooks/                 # Action and utility hooks
        │   ├── use-chat-actions.ts
        │   └── use-get-chat-details.ts
        ├── stores/                # Feature stores
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

## 🔄 State Management & Data Loading Architecture

### Zustand-Centric Data Management

The application uses **Zustand stores as the primary data layer**, handling all data fetching, caching, and state management. Components interact with stores directly, not through data fetching hooks.

### Data Loading Pattern

**Core Principle**: Business logic and data management are encapsulated within Zustand stores. Components interact with stores for data and business operations, while hooks handle UI-specific logic.

```typescript
// Example: file-system.store.ts
export const useFileSystemStore = create<FileSystemStore>((set, get) => ({
  // State
  entities: {},
  childrenOf: {},
  isLoadingParentIds: new Set(),

  // Actions
  loadData: async (parentId: string, parentType?: EntityEnum) => {
    const { isLoadingParentIds } = get();

    // Prevent duplicate loading
    if (isLoadingParentIds.has(parentId)) return;

    // Set loading state
    set(state => ({
      isLoadingParentIds: new Set([...state.isLoadingParentIds, parentId]),
    }));

    try {
      // Fetch data from services
      const [directories, chats] = await Promise.all([
        DirectoriesService.getDirectories(parentId),
        ChatsService.getChats(parentId),
      ]);

      // Update store state
      set(state => ({
        entities: { ...state.entities, ...mapToEntities(directories, chats) },
        childrenOf: { ...state.childrenOf, [parentId]: [...directories, ...chats] },
        isLoadingParentIds: removeFromSet(state.isLoadingParentIds, parentId),
      }));
    } catch (error) {
      // Handle error
      set(state => ({
        isLoadingParentIds: removeFromSet(state.isLoadingParentIds, parentId),
      }));
    }
  },

  // Selectors
  isParentLoading: (parentId: string) => {
    return get().isLoadingParentIds.has(parentId);
  },
}));
```

### Component Integration Pattern

Components call store actions on mount, typically wrapped in a utility hook for reusability:

```typescript
// Example: use-load-data.ts
export const useLoadData = (parentId?: string, parentType?: EntityEnum) => {
  const loadData = useFileSystemStore(state => state.loadData);
  const isParentLoading = useFileSystemStore(state => state.isParentLoading);
  const childrenOf = useFileSystemStore(state => state.childrenOf);

  const actualParentId = parentId || 'root';

  useEffect(() => {
    // Check if data already loaded
    const hasChildren = childrenOf[actualParentId]?.length >= 0;

    // Load only if needed
    if (!hasChildren && !isParentLoading(actualParentId)) {
      loadData(actualParentId, parentType);
    }
  }, [actualParentId, parentType]);

  return {
    isLoading: isParentLoading(actualParentId),
    data: childrenOf[actualParentId] || [],
  };
};
```

## 🪝 Hooks Architecture

### Hook Types and Responsibilities

Hooks are organized by purpose, all residing directly in feature `/hooks` folders:

```
src/features/[feature]/hooks/
├── use-[feature]-actions.ts     # Orchestrate store actions with navigation
├── use-[component]-logic.ts     # UI component logic (forms, animations, etc.)
└── use-[utility].ts             # Utility hooks (DnD, debounce, etc.)

src/hooks/
├── use-debounce.ts              # Shared utility hooks
├── use-url-params.ts            # Common functionality
└── cache-keys.ts                # Centralized cache key management
```

### Hook Types and Responsibilities

**UI Component Logic Hooks**

- **Purpose**: Handle UI-specific logic, animations, form state, and user interactions
- **Pattern**: `use-[component]-logic.ts`
- **Example**: `use-tree-dnd-logic.ts`, `use-messages-logic.ts`

**Action Coordination Hooks**

- **Purpose**: Coordinate store actions with navigation and UI side effects
- **Pattern**: `use-[feature]-actions.ts`
- **Note**: Business logic should be in stores, these hooks only orchestrate

```typescript
// Example: use-file-system-actions.ts
// This hook ONLY coordinates store actions with navigation
// Business logic lives in the store
export const useFileSystemActions = () => {
  const navigate = useNavigate();
  // Get business logic from store
  const createEntity = useFileSystemStore(state => state.createEntity);
  const deleteEntity = useFileSystemStore(state => state.deleteEntity);

  // Only coordination - actual business logic is in store
  const createAndNavigate = async (name: string, type: EntityEnum) => {
    const entity = await createEntity(name, type); // Business logic in store
    if (type === EntityEnum.Chat) {
      navigate(`/chat/${entity.id}`); // Navigation side effect
    }
    return entity;
  };

  return {
    createAndNavigate,
  };
};
```

### Store Usage in Components

**Direct Store Access**: Components can directly use store selectors and actions:

```typescript
import { shallow } from 'zustand/shallow';

const FileExplorer = () => {
  // Single selectors for state
  const entities = useFileSystemStore(state => state.entities);
  const isLoading = useFileSystemStore(state => state.isParentLoading('root'));

  // Single action selector
  const loadData = useFileSystemStore(state => state.loadData);

  // Multiple actions with shallow comparison
  const { createEntity, deleteEntity, moveEntity } = useFileSystemStore(
    state => ({
      createEntity: state.createEntity,
      deleteEntity: state.deleteEntity,
      moveEntity: state.moveEntity,
    }),
    shallow
  );

  // UI action hook for navigation coordination
  const createAndNavigate = useFileSystemActions(state => state.createAndNavigate);

  // Load data on mount
  useEffect(() => {
    loadData('root');
  }, [loadData]);

  const handleCreate = async (name: string) => {
    // Use store action directly for business logic
    await createEntity(name, EntityEnum.Directory);
    // Or use action hook for navigation coordination
    await createAndNavigate(name, EntityEnum.Chat);
  };

  return <div>{/* Component UI */}</div>;
};
```

### Key Principles

**✅ Zustand Stores SHOULD:**

- Handle all data fetching and caching
- Manage loading and error states
- Contain ALL business logic and rules
- Expose actions for CRUD operations
- Maintain normalized entity state
- Provide selectors for computed values
- Handle complex business workflows

**✅ UI Hooks SHOULD:**

- Handle component-specific UI logic
- Manage form state and validation
- Handle animations and interactions
- Coordinate store actions with navigation
- Bridge store actions with UI side effects

**❌ Hooks SHOULD NOT:**

- Contain business logic (this belongs in stores)
- Call services directly
- Make decisions about data transformations

**❌ Components SHOULD NOT:**

- Call services directly
- Use SWR hooks for data that belongs in stores
- Manage complex state locally

## 🔄 SWR Best Practices

### ✅ Always Use Centralized Cache Keys

Never use hardcoded strings for mutation keys. Always import from the centralized `cache-keys.ts`:

**✅ Correct:**

```typescript
import { MUTATION_KEYS, CACHE_KEYS } from '@hooks/cache-keys';

// Use centralized mutation keys
useSWRMutation(MUTATION_KEYS.directories.move, mutationFn);
useSWRMutation(MUTATION_KEYS.chats.create, mutationFn);

// Use centralized cache keys
CACHE_KEYS.directories.withParent(parentId);
CACHE_KEYS.chats.details(chatId);
```

**❌ Wrong:**

```typescript
// ❌ Hardcoded strings - hard to maintain and refactor
useSWRMutation('move-directory', mutationFn);
useSWRMutation('create-chat', mutationFn)[
  // ❌ Inconsistent cache key patterns
  ('directories', parentId)
][('chat-details', chatId)];
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

  return <div className="...">{/* Component JSX */}</div>;
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

- **All Folders**: Use `kebab-case`
  - Examples: `user-card/`, `chat-header/`, `sign-in-form/`, `api-client/`, `form-utils/`
- **All Files**: Use `kebab-case`
  - Examples: `local-storage.ts`, `time-helpers.ts`, `formatters.ts`
- **Component Files**: Use `kebab-case.tsx`
  - Examples: `sign-in-form.tsx`, `chat-message.tsx`, `user-dropdown.tsx`
- **Hook Files**: Use `kebab-case.ts`
  - Examples: `use-sign-in-logic.ts`, `use-messages-logic.ts`, `use-file-system-actions.ts`

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
