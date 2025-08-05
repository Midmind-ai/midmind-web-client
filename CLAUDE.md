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
│   ├── App.tsx                    # Root component
│   ├── RootProvider.tsx           # Top-level provider composition
│   └── Router.tsx                 # Application routing configuration
│
├── shared/                        # Reusable elements not tied to specific features
│   ├── theme/                     # Tailwind theme configuration
│   ├── services/                  # API service layers (userService, authService)
│   ├── assets/                    # Global assets (logo, fonts, icons)
│   ├── config/                    # Library configurations (axios instance)
│   ├── components/                # Global UI components (Button, Modal, Input)
│   ├── constants/                 # Shared constants (API endpoints, route names)
│   ├── hooks/                     # Global hooks (useDebounce, useOutsideClick)
│   ├── utils/                     # Utility functions (cn, formatDate)
│   ├── types/                     # Global TypeScript types (User, Role)
│   └── stores/                    # Global Zustand stores (useUserStore, useThemeStore)
│
└── features/                      # Feature-based modules
    ├── SignIn/
    │   ├── components/            # Feature-specific components
    │   │   └── SignInForm/
    │   │       ├── SignInForm.tsx         # Component implementation
    │   │       └── useSignInFormLogic.ts  # Component logic hook
    │   ├── assets/                # Feature-specific assets
    │   ├── hooks/                 # Feature-specific hooks
    │   ├── stores/                # Feature-specific stores
    │   ├── types/                 # Feature-specific types
    │   └── utils/                 # Feature-specific utilities
    │
    └── Chat/
        ├── components/
        │   └── Messages/
        │       ├── Messages.tsx
        │       └── useMessagesLogic.ts
        ├── assets/
        ├── hooks/
        ├── stores/
        ├── types/
        └── utils/
```

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