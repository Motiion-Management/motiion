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
