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