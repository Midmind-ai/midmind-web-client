# 🚀 Midmind Web Client

A modern React-based web application built with TypeScript, featuring a clean architecture and comprehensive UI components.

## 🧱 Tech Stack

### ⚙️ Core Libraries

- **React 19** — Latest React with concurrent features
- **React Router 7** — Modern client-side routing
- **TypeScript 5.8** — Type-safe development

### 🗃️ State Management

- **Zustand 5** — Lightweight global state management
- **SWR 2** — Remote data fetching and caching with revalidation

### 📡 API & Communication

- **Axios** — HTTP client for API communication
- **Socket.io Client** — Real-time WebSocket communication
- **OpenAPI Typescript** — Auto-generated API types

### 🎨 Styling & UI

- **Tailwind CSS 4** — Utility-first CSS framework
- **Shadcn/UI** — Accessible UI components built on Radix UI primitives
- **Radix UI** — Unstyled, accessible UI primitives
- **Lucide React** — Beautiful, customizable icons

### 🧠 Forms & Validation

- **React Hook Form** — Flexible and performant form management
- **Zod** — Schema-based validation with TypeScript support
- **@hookform/resolvers** — Form validation resolvers

### 🛠️ Build Tools

- **Vite 7** — Fast build tool and dev server
- **ESLint 9** — Code linting and quality
- **Prettier** — Code formatting
- **Husky** — Git hooks for code quality

## 📁 Project Structure

The codebase follows a feature-based architecture with clear separation of concerns:

```
src/
├── app/                           # Application core and routing
│   ├── providers/                 # App-wide providers (SWR, Theme)
│   ├── routes/                    # Page components
│   │   ├── home.tsx              # Home page
│   │   ├── chat.tsx              # Chat interface
│   │   ├── sign-in.tsx           # Authentication
│   │   ├── sign-up.tsx           # User registration
│   │   ├── forgot-password.tsx   # Password recovery
│   │   └── not-found.tsx         # 404 page
│   ├── app.tsx                   # Root component
│   ├── router.tsx                # Application routing
│   ├── root-layout.tsx           # Root layout wrapper
│   ├── root-provider.tsx         # Top-level providers
│   ├── split-layout.tsx          # Split view layout
│   └── modals-renderer.tsx       # Modal management
│
├── features/                      # Feature-based modules
│   ├── chat/                     # Chat functionality
│   │   ├── components/           # Chat UI components
│   │   │   ├── chat-message-form/
│   │   │   ├── connection-type-badge/
│   │   │   ├── highlighted-text-wrapper/
│   │   │   ├── llm-response/
│   │   │   ├── message-context-menu/
│   │   │   ├── message-list/
│   │   │   ├── quick-action-button/
│   │   │   ├── react-markdown/
│   │   │   └── user-message/
│   │   ├── hooks/                # Chat logic hooks
│   │   ├── types/                # Chat-specific types
│   │   ├── utils/                # Chat utilities
│   │   └── constants/            # AI models configuration
│   │
│   ├── sidebar/                   # Sidebar navigation
│   │   ├── components/            # Sidebar UI components
│   │   │   ├── create-directory-modal/
│   │   │   ├── folder-actions/
│   │   │   ├── folder-list/
│   │   │   ├── more-actions-menu/
│   │   │   ├── organization-switcher/
│   │   │   ├── sidebar-header/
│   │   │   ├── sidebar-tabs/
│   │   │   ├── tree/
│   │   │   └── user-dropdown/
│   │   ├── hooks/                 # Sidebar logic hooks
│   │   └── sidebar.tsx            # Main sidebar component
│   │
│   ├── navigation-header/         # Top navigation
│   │   ├── components/            # Navigation components
│   │   │   ├── breadcrumb-item/
│   │   │   └── breadcrumbs/
│   │   └── navigation-header.tsx  # Main navigation component
│   │
│   └── sign-in/                   # Authentication
│       ├── components/             # Auth UI components
│       │   ├── protected-route/
│       │   └── sign-in-form/
│       ├── hooks/                  # Authentication logic
│       ├── assets/                 # Auth-related assets
│       └── sign-in.tsx             # Main sign-in component
│
├── shared/                        # Reusable components and utilities
│   ├── components/ui/             # Base UI components
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── themed-*.tsx           # Typography components
│   │   └── ...                    # Other UI components
│   ├── services/                  # API services
│   │   ├── auth/                  # Authentication service
│   │   ├── chats/                 # Chat management
│   │   ├── conversations/         # Conversation handling
│   │   ├── directories/           # Directory management
│   │   ├── messages/              # Message handling
│   │   └── users/                 # User management
│   ├── hooks/                     # Global hooks
│   ├── stores/                    # Global state stores
│   ├── types/                     # Shared type definitions
│   ├── utils/                     # Utility functions
│   ├── config/                    # Configuration files
│   ├── constants/                 # Shared constants
│   └── theme/                     # Theme configuration
│
└── generated/                     # Auto-generated files
    └── api-types.ts               # OpenAPI generated types
```

## 🧩 Component Architecture

### Component Structure

All components follow a consistent pattern with separated logic:

```tsx
type Props = {
  someProp: string;
};

const MyComponent = ({ someProp }: Props) => {
  const { data, handlers } = useMyComponentLogic();

  return <div className="component-wrapper">{/* Component JSX */}</div>;
};

export default MyComponent;
```

### Logic Separation

Component logic is extracted into custom hooks following the pattern:

- **Hook naming**: `use[ComponentName]Logic.ts`
- **File location**: `components/[component-name]/use-[component-name]-logic.ts`
- **Logic encapsulation**: All business logic, state management, and event handlers

### Key Patterns

- ✅ **Type-safe props** — Explicit Props type definition
- ✅ **Arrow functions** — Consistent functional component syntax
- ✅ **Logic separation** — Custom hooks for component logic
- ✅ **Default exports** — Clean import statements
- ✅ **Tailwind classes** — Utility-first styling approach

## 🏷️ Naming Conventions

### 🧬 Code Elements

- **Variables & Functions**: `camelCase` (e.g., `isPasswordVisible`, `getUserData`)
- **Types & Components**: `PascalCase` (e.g., `ChatHeader`, `UserRoles`)
- **API Types**: `VerbNounRequest`/`VerbNounResponse` pattern (e.g., `GetCurrentUserRequest`)

### 📦 Files & Folders

- **Components**: `PascalCase` (e.g., `UserCard/`, `ChatHeader/`)
- **General folders**: `kebab-case` (e.g., `api-client/`, `form-utils/`)
- **Files**: `camelCase` for utilities, `PascalCase` for components (e.g., `localStorage.ts`, `UserCard.tsx`)

### 🎯 Event Handlers

- **Click events**: `handleClick`, `handleButtonClick`
- **Form events**: `handleSubmit`, `handleInputChange`
- **Keyboard events**: `handleKeyDown`, `handleKeyPress`

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 18+
- **Yarn** package manager

### 📋 Getting Started

1. **Clone and navigate to project**

```bash
git clone https://github.com/Midmind-ai/midmind-web-client.git
cd midmind-web-client
```

2. **Install dependencies**

```bash
yarn install
```

3. **Environment configuration**
   Create `.env.dev` file in the root directory with required environment variables.

4. **Start development server**

```bash
yarn dev
```

The application will be available at `http://localhost:5173/`

### 📜 Available Scripts

- **`yarn dev`** — Start development server
- **`yarn build`** — Build for production
- **`yarn preview`** — Preview production build
- **`yarn lint`** — Run ESLint with auto-fix
- **`yarn format`** — Format code with Prettier
- **`yarn types:check`** — TypeScript type checking
- **`yarn types:generate`** — Generate API types from OpenAPI spec

### 🔧 Development Tools

- **ESLint** — Code quality and consistency
- **Prettier** — Code formatting
- **Husky** — Git hooks for code quality
- **TypeScript** — Static type checking
- **Vite** — Fast development and building

## 🎨 UI Component System

### Base Components

Built on Radix UI primitives with Tailwind CSS styling:

- **Form Elements**: Input, Select, Textarea, Button
- **Layout**: Dialog, Sheet, Sidebar, Resizable panels
- **Navigation**: Breadcrumbs, Dropdown menus, Context menus
- **Feedback**: Badge, Skeleton, Tooltip, Avatar

### Themed Components

Custom typography components with consistent styling:

- **Headings**: `ThemedH1`, `ThemedH2`, `ThemedH3`
- **Text**: `ThemedP`, `ThemedSpan`

### Styling Approach

- **Tailwind CSS 4** for utility-first styling
- **CSS Variables** for theme customization
- **Responsive design** with mobile-first approach
- **Accessibility** built into all components

## 🚀 Key Features

### 💬 Chat System

- Real-time messaging with AI models
- Message context and threading
- Markdown rendering support
- Quick action buttons
- Message highlighting and selection

### 📁 File Management

- Hierarchical directory structure
- Folder creation and management
- Chat organization by directories
- Tree-based navigation

### 🔐 Authentication

- OAuth integration (Google, GitHub)
- Protected routes
- User session management
- Organization switching

### 🎯 Navigation

- Breadcrumb navigation
- Responsive sidebar
- Split view layouts
- Modal management system

## 🤝 Contributing

1. Follow the established naming conventions
2. Use the component architecture patterns
3. Extract logic into custom hooks
4. Ensure proper TypeScript typing
5. Follow the established folder structure
6. Run linting and type checking before commits

---

🎉 Happy coding! Build something amazing! 🚀
