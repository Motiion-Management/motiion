# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Motiion is a TypeScript monorepo for a talent management platform with web and mobile applications. It uses:

- **Turborepo** for monorepo management with pnpm workspaces
- **Convex** for backend, database, and real-time server functions
- **Clerk** for authentication
- **Next.js 15** for the web app || NOTE: This is currently not being maintained
- **React Native (Expo)** for the mobile app || NOTE: This is currently the primary app we are building

## Common Development Commands

### Root Level Commands

```bash
# Development
pnpm dev          # Run all apps with Turbo UI
pnpm web          # Run only web app
pnpm native       # Run only native app
pnpm backend      # Run only Convex backend

# Build & Deploy
pnpm build        # Build all apps
pnpm clean        # Clean all build artifacts and node_modules

# Code Quality
pnpm format       # Format all code with Prettier
pnpm type-check   # Run TypeScript checking across monorepo
```

### App-Specific Commands

**Native App (apps/native/)**

```bash
pnpm dev                    # Start Expo dev client
pnpm ios                    # Run on iOS simulator
pnpm android                # Run on Android emulator
pnpm build:dev              # EAS development build
pnpm build:preview          # EAS preview build
pnpm build:prod             # EAS production build
pnpm lint                   # Run ESLint
```

**Web App (apps/web/)**

```bash
pnpm dev                    # Start Next.js with Turbopack
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run Next.js linting
```

**Backend (packages/backend/)**

```bash
pnpm dev                    # Start Convex development server
pnpm build                  # Deploy to Convex production
pnpm setup                  # Initial Convex setup
```

## Architecture Overview

### Monorepo Structure

- **apps/native**: React Native mobile app using Expo Router for navigation
- **apps/web**: Next.js web app with App Router
- **packages/backend**: Convex backend with database schemas and server functions
- **packages/web-ui**: Shared UI components (currently web-focused) || NOTE: This is not being used right now

### Key Architectural Patterns

1. **Real-time by Default**: All data fetching uses Convex's reactive `useQuery` hooks that automatically subscribe to changes

2. **End-to-End Type Safety**: TypeScript types flow from Convex schema definitions through to frontend components

3. **Authentication Flow**:

   - Clerk handles user authentication
   - Convex validates JWT tokens from Clerk
   - User data synced between Clerk and Convex

4. **Form Handling**:

   - Native app uses react-hook-form with custom form components
   - Web app uses react-hook-form with Radix UI components
   - Shared validation schemas using Zod

5. **Styling**:
   - Native: NativeWind (TailwindCSS for React Native)
   - Web: TailwindCSS with Radix UI components

### Database Schema Location

All database schemas are defined in `packages/backend/convex/schema.ts`. Server functions are organized by domain in the same directory.

### Environment Variables

Each app needs its own `.env` file:

- `apps/web/.env.local`
- `apps/native/.env`

Required variables:

- `{NEXT,EXPO}_PUBLIC_CONVEX_URL`: From packages/backend/.env.local
- `{NEXT,EXPO}_PUBLIC_CLERK_PUBLISHABLE_KEY`: From Clerk dashboard
- `CLERK_SECRET_KEY` (web only): From Clerk dashboard

## Code Formatting

- No semicolons
- Single quotes for strings
- 2-space indentation
- Prettier is configured and should be run before commits

## Code Style Guide

### Core Principles

1. **Clarity Over Cleverness**: Write code that is immediately understandable. Avoid complex one-liners or clever tricks that sacrifice readability.

2. **Single Responsibility**: Each function, component, and module should have one clear purpose. If you can't describe what it does in one sentence, it's doing too much.

3. **Explicit Over Implicit**: Make types, imports, and data flow explicit. Avoid magic or hidden behavior.

### Component Design

1. **Minimal Component Logic**: Components should be as simple as possible, focusing on:

   - Managing UI state
   - Rendering UI elements
   - Passing data between hooks and context

2. **Extract Complex Logic to Hooks**: Business logic, data transformations, and side effects belong in custom hooks, not components.

3. **Granular Callbacks**: Prefer multiple single-purpose callbacks over one callback that handles multiple cases:

   ```typescript
   // Good
   onChangeCountryCode?: (code: CountryCode) => void
   onChangeCountry?: (country: Country) => void

   // Avoid
   onCountryUpdate?: (data: { code?: CountryCode; country?: Country }) => void
   ```

### TypeScript Patterns

1. **Explicit Type Imports**: Import types explicitly to improve code documentation:

   ```typescript
   import { Country, type CountryCode } from 'react-native-country-picker-modal'
   ```

2. **Interface Over Type for Objects**: Use interfaces for object shapes and types for unions/primitives:

   ```typescript
   interface UserProps {
     name: string
     age: number
   }

   type Status = 'active' | 'inactive' | 'pending'
   ```

3. **Avoid Any**: Never use `any`. Use `unknown` if type is truly unknown and narrow it down.

### Data Flow

1. **Unidirectional**: Data should flow in one direction - from parent to child, from hook to component.

2. **Predictable Updates**: Each piece of state should have one clear update path.

3. **No Hidden Side Effects**: State updates should be explicit and traceable.

### Hook Design

1. **Consistent Return Pattern**: Return an object with categorized exports:

   ```typescript
   return {
     models: {
       /* state values */
     },
     actions: {
       /* functions */
     },
     forms: {
       /* form-specific utilities */
     }
   }
   ```

2. **Memoize Callbacks**: Use useCallback for functions passed to child components.

3. **Self-Contained**: Hooks should encapsulate all related logic and not leak implementation details.

### General Guidelines

1. **Remove Unused Code**: Delete unused props, imports, and variables immediately.

2. **Descriptive Names**: Use full words, not abbreviations. `phoneNumber` not `phoneNum`.

3. **Early Returns**: Handle edge cases and errors at the top of functions.

4. **Consistent Patterns**: Follow existing patterns in the codebase rather than introducing new ones.

## Component Architecture Guidelines

### Directory Structure

Components must be organized by their primary responsibility:

```
components/
├── ui/                    # Pure visual components
│   ├── Card.tsx          # Display-only components
│   ├── Button.tsx        # Interactive UI elements
│   └── Modal.tsx         # Layout/container components
├── form/                  # Form-specific components
│   ├── FormField.tsx     # Form field wrappers
│   ├── validators/       # Validation schemas
│   └── hooks/            # Form-related hooks
└── [domain]/             # Business logic components
    ├── UserSection.tsx   # Domain-specific orchestration
    └── hooks/            # Domain-specific hooks
```

### Component Responsibilities

1. **UI Components** (`components/ui/`):
   - **Purpose**: Visual presentation and user interaction only
   - **Rules**: 
     - No business logic or data fetching
     - Receive all data via props
     - Only manage UI-specific state (hover, focus, etc.)
     - Must be pure and testable in isolation

2. **Form Components** (`components/form/`):
   - **Purpose**: Form field integration and validation
   - **Rules**:
     - Thin wrappers around UI components
     - Handle form state binding and validation
     - Extract complex logic to custom hooks
     - Type-safe field definitions

3. **Domain Components** (`components/[domain]/`):
   - **Purpose**: Business logic coordination and data orchestration
   - **Rules**:
     - Compose UI and form components
     - Handle data fetching and mutations
     - Manage complex state through hooks
     - Coordinate between multiple UI elements

### Anti-Patterns to Avoid

1. **Circular Dependencies**: Components should not import from their own dependency tree
2. **Mixed Responsibilities**: UI components should not contain business logic
3. **Imperative APIs**: Prefer controlled components over ref-based imperative APIs
4. **Deep Prop Drilling**: Use hooks to encapsulate related state and actions
5. **Any Types**: Always provide proper TypeScript types

### Hook Design Patterns

Extract component logic into custom hooks following this pattern:

```typescript
// Good: Encapsulated hook with clear return structure
function useFeatureLogic() {
  return {
    models: {
      data: /* state values */,
      isLoading: /* boolean states */,
    },
    actions: {
      handleSave: /* memoized callbacks */,
      handleDelete: /* memoized callbacks */,
    },
    forms: {
      register: /* form utilities */,
      errors: /* validation state */,
    }
  }
}

// Component becomes thin wrapper
function FeatureComponent() {
  const { models, actions, forms } = useFeatureLogic()
  
  return (
    <UIComponent 
      data={models.data}
      onSave={actions.handleSave}
      {...forms.register('field')}
    />
  )
}
```

### Refactoring Checklist

Before creating new components, ensure:

- [ ] Component has single, clear responsibility
- [ ] No circular import dependencies
- [ ] Complex logic extracted to custom hooks
- [ ] Props are typed explicitly
- [ ] UI components are pure and testable
- [ ] Form logic is separated from UI logic
- [ ] Business logic is in domain-specific components/hooks

## Development Notes

### Mobile App Specifics

- Uses Expo SDK 53 with React Native 0.79.2
- Custom NativeWind UI components in `apps/native/components/nativewindui/`
- Form components use `react-hook-form` with custom wrappers
- Navigation uses file-based routing with Expo Router

### Web App Specifics

- Next.js 15 with App Router
- PWA support with Serwist
- UI components from Radix UI with custom styling
- Server components by default, client components marked with "use client"

### Convex Integration

- All database queries/mutations go through Convex functions
- Real-time subscriptions handled automatically
- File uploads use Convex file storage
- Background jobs use Convex scheduled functions
