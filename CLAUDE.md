# CLAUDE.md

TypeScript monorepo for talent management platform. Primary focus: React Native mobile app.

**Stack:** Turborepo + pnpm, Convex backend, Clerk auth, Expo/React Native
**Assumption:** User has `pnpm dev` running unless specified otherwise

## ENFORCE: Component Architecture

### Directory Structure (STRICT)

```
components/
├── ui/           # Pure visual, no business logic, props only
├── form/         # Form wrappers, validation binding
└── [domain]/     # Business logic, data fetching, state orchestration
```

### Component Rules (ENFORCE)

- **UI components**: No data fetching, no business logic, pure presentation
- **Form components**: Thin wrappers around UI, handle form state only
- **Domain components**: Orchestrate UI/form components, handle data/state
- **Extract complex logic to custom hooks**
- **NO circular dependencies**
- **NO mixed responsibilities**

### Hook Pattern (ENFORCE)

```typescript
function useFeatureLogic() {
  return {
    models: {
      /* state values */
    },
    actions: {
      /* memoized callbacks */
    },
    forms: {
      /* form utilities */
    }
  }
}
```

## ENFORCE: TypeScript Patterns

- **Interface for objects, type for unions/primitives**
- **Explicit type imports**: `import { type CountryCode }`
- **Never use `any`** - use `unknown` and narrow
- **Granular callbacks** over single callback with multiple cases

## ENFORCE: Code Standards

- No semicolons, single quotes, 2-space indentation
- Descriptive names (no abbreviations)
- Early returns for edge cases
- Remove unused code immediately
- Follow existing patterns over new ones

## Essential Commands

```bash
pnpm format       # Format code
pnpm type-check   # TypeScript checking
pnpm clean        # Clean build artifacts
```

## Architecture Essentials

### Structure

- **apps/native**: React Native mobile app (PRIMARY FOCUS)
- **apps/web**: Next.js web app (DEPRECATED - not maintained)
- **packages/backend**: Convex backend + database schemas

### Key Patterns

- **Real-time by default**: All data fetching uses Convex `useQuery` hooks
- **End-to-end type safety**: Types flow from Convex schema to frontend
- **Authentication**: Clerk → Convex JWT validation → user data sync
- **Forms**: react-hook-form + Zod validation schemas
- **Styling**: NativeWind (TailwindCSS for React Native)

### Critical Locations

- **Database schemas**: `packages/backend/convex/schema.ts`
- **Server functions**: `packages/backend/convex/` (organized by domain)
- **Native UI components**: `apps/native/components/nativewindui/`
- **Sheet/Modal components**: `apps/native/components/ui/sheet/` - ALWAYS use this for bottom sheets

### Environment Setup

- **Native**: `apps/native/.env`
- **Backend**: `packages/backend/.env.local`

Required vars:

- `EXPO_PUBLIC_CONVEX_URL`
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

## Technical Specifics

### Mobile App

- Expo SDK 54 + React Native 0.80
- **Continuous Native Generation (CNG)** - All native changes should be made via app.json/expo config or plugins
- File-based routing with Expo Router
- Custom NativeWind UI components
- react-hook-form with custom wrappers

### Convex Integration

- All database queries/mutations through Convex functions
- Real-time subscriptions automatic
- File uploads use Convex file storage
- Background jobs use Convex scheduled functions

## Claude Preferred Behavior

- When fixing code, include only the relevant changes
- Prefer concise explanations over verbose ones
- Don't repeat unchanged code unless I ask
- In code generation, include minimal necessary imports

## ENFORCE: Convex Development Patterns

### Always Reference Documentation

- **ALWAYS consult @docs/convex_rules.txt** when working with Convex functions
- Check for updates to patterns and best practices before implementing

### Validator Pattern (STRICT)

```typescript
// 1. Plain object with Zod validators
export const tableName = {
  field1: z.string(),
  field2: zid('otherTable').optional()
}

// 2. Table export using convex-helpers
export const TableName = Table('tableName', zodToConvexFields(tableName))

// 3. In schema.ts - use .table property
tableName: TableName.table.index('by_field1', ['field1'])
```

### Function Patterns (ENFORCE)

- **ALWAYS include returns validator** - even `returns: v.null()` for void functions
- Use new function syntax from convex_rules.txt
- Name indexes with pattern: `by_field1_and_field2`
- Export functions directly, never through api/internal objects

### Import Consistency

```typescript
// Validator files
import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'

// Convex function files
import { query, mutation, internalMutation } from './_generated/server'
import { ConvexError, v } from 'convex/values'
```

## Experimental Software Preference

- **Embrace beta/experimental versions** - If beta or experimental packages are installed, work with them rather than suggesting downgrades
- **Novel solutions over safety** - Find creative workarounds and novel approaches instead of reverting to stable versions
- **Debug compatibility issues** - When experimental versions cause conflicts, debug and patch rather than downgrade
- **Stay bleeding edge** - Preference for using latest features and experimental APIs when available
