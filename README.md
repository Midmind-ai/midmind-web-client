# 🚀 Midmind — Front-end project documentation

Here you'll find the key rules, conventions, and patterns to follow when developing features for this project. This guide helps keep our codebase clean, consistent, and easy to scale.

## 🧱 Tech Stack

Before diving into the code, let’s take a quick look at the front-end stack used in this project.

### ⚙️ Core Libraries

- **React / React DOM** — UI rendering and component logic.
- **React Router** — Client-side routing and navigation.

### 🗃️ State Management

- **Zustand** — Lightweight global state management store.

### 📡 API

- **Axios** — HTTP client for API communication.
- **SWR** — Remote data fetching and caching with revalidation.
- **Socket.io Client** — Real-time WebSocket communication.

### 🎨 Styling

- **Tailwind CSS** — Utility-first CSS framework for styling.
- **Shadcn/UI** — Accessible, unstyled UI components built on Radix UI primitives.

### 🧠 Forms & Validation

- **React Hook Form** — Flexible and performant form management.
- **Zod** — Schema-based form and data validation with TypeScript support.

## 📁 Project Structure

The codebase strives for a clear separation between application setup, shared resources, and individual features.

```sh
src
|
+- app                               # Global application logic (wrapping all features)
|  |
|  +- providers                      # App-wide providers (e.g., ThemeProvider, AuthProvider)
|  +- routes                         # Pages (e.g., Home, SignIn)
|  +- App.tsx                        # Root component
|  +- RootProvider.tsx               # Top-level provider
|  +- Router.tsx                     # Application router (e.g., defines routes for Home and Chat)
|
+- shared                            # Reusable elements not tied to specific features
|  |
|  +- theme                          # Tailwind theme config (e.g., fontFamily, color palette)
|  +- services                       # API requests (e.g., userService, authService)
|  +- assets                         # Global assets (e.g., app logo, generic icons)
|  +- config                         # Library configurations (e.g., axios instance, i18n setup)
|  +- components                     # Global UI components (e.g., Button, Modal)
|  +- constants                      # Shared constants (e.g., API endpoints, route names)
|  +- hooks                          # Global hooks (e.g., useDebounce, useOutsideClick)
|  +- utils                          # Utility functions (e.g., cn for classNames, formatDate)
|  +- types                          # Global types (e.g., User, Role)
|  +- stores                         # Global state stores (e.g., useUserStore, useThemeStore)
|
+- features                          # Application features (feature-based logic)
|  |
|  +- SignIn                         # Sign-in feature
|  |  |
|  |  +- components                  # Sign-in UI components (e.g., SignInForm, OAuthButton)
|  |  |  |
|  |  |  +- SignInForm
|  |  |     |
|  |  |     +- SignInForm.tsx             # Main component entry point
|  |  |     +- useSignInLogic.ts     # Custom hook encapsulating component logic
|  |  |
|  |  +-- assets                     # Sign-in images/icons (e.g., Google logo, login illustration)
|  |  +-- hooks                      # Sign-in logic (e.g., useSignIn, useLoginRedirect)
|  |  +-- stores                     # Sign-in related stores (e.g., useSignInFormStore)
|  |  +-- types                      # Sign-in-specific types (e.g., SignInFormData, SignInError)
|  |  +-- utils                      # Sign-in helpers (e.g., parseAuthErrors, transformPayload)
|  |
|  +- Chat                           # Chat feature
|  |  |
|  |  +- components                  # Chat UI components (e.g., Messages, SendMessageForm)
|  |  |  |
|  |  |  +- Messages
|  |  |     |
|  |  |     +- Messages.tsx             # Main component entry point
|  |  |     +- useMessagesLogic.ts   # Custom hook encapsulating component logic
|  |  |
|  |  +- assets                      # Chat-specific assets (e.g., user avatar placeholder, chat icons)
|  |  +- hooks                       # Chat logic (e.g., useMessages, useSendMessage)
|  |  +- stores                      # Chat state stores (e.g., useChatStore, useTypingStore)
|  |  +- types                       # Chat-related types (e.g., Message, ChatThread)
|  |  +- utils                       # Chat utilities (e.g., groupMessagesByDate, formatMessageTime)
```

## 🧩 Component Style

All components follow a consistent and simple style guide to improve readability and maintainability:

```tsx
type Props = {
  someProp: string;
};

const MyComponent = ({ someProp }: Props) => {
  const data = useMyComponentLogic();

  return <div>MyComponent</div>;
};

export default MyComponent;
```

### ✍️ Key points

- ✅ **Type-safe props** — Component props are always explicitly typed using type, and the name is always **Props** for consistency.
- ✅ **Arrow functions** — Functional components are written as arrow functions for consistency.
- ✅ **Encapsulated logic** — All component-related logic is extracted into a separate hook named in the format use[ComponentName]Logic.ts (e.g. `useSignInFormLogic.ts`) to ensure separation of concerns and cleaner JSX.
- ✅ **Default export** — Components use export default to keep imports clean and predictable.

## 🏷️ Naming Conventions

### 🧬 Variables, Functions & Types

- ✅ Use **camelCase** for variables and functions. Examples: `isPasswordVisible`, `getUserData`.
- ✅ Use **PascalCase** for types, enum-like objects and components. Examples: `ChatHeader`, `UserRoles`.
- ✅ Follow `VerbNounRequest` / `VerbNounResponse` naming for API types. Example: for `getCurrentUser()`, use `GetCurrentUserRequest` and `GetCurrentUserResponse`

### 📦 Files & Folders

- ✅ Use **PascalCase** for components folders, types (e.g. `UserCard`, `ChatHeader`)
- ✅ Use **kebab-case** for general-purpose folders (e.g. `api-client`, `form-utils`)
- ✅ Use **camelCase** for individual file names (especially utilities and logic files e.g. `locaStotage.ts`, `timeHelpers.ts`)

## 🛠️ Project Setup and Run

This project uses **Yarn** as the package manager.

### 📋 Steps to get started

1. **Clone the repository and navigate to the project folder**

```bash
git clone https://github.com/Midmind-ai/midmind-web-client.git
cd midmind-web-client
```

2. **Install dependencies**

```bash
yarn install
```

3. **Create environment variables file**

Create a file named `.env.dev` in the root of the project.
Ask one of your teammates for the contents of this file, as it contains important configuration variables needed for local development.

4. **Start the development server**

```bash
yarn dev
```

Once the server starts, open your browser and navigate to http://localhost:5173/ (or the port shown in the terminal).

If you run into any issues, reach out to a teammate for help.

🎉 Enjoy coding and have fun building awesome stuff! 🚀
