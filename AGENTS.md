# Repository Guidelines

## Project Structure & Module Organization

- `apps/web`: Next.js marketing + web app (TypeScript, Tailwind).
- `apps/native`: Expo/React Native app (EAS, Expo Router).
- `packages/backend`: Convex backend (schema, server functions).
- `packages/web-ui`: Shared web UI components and business logic.
- `packages/primatives`: Reusable UI primitives.
- `docs/`: Internal notes and plans.

## Build, Test, and Development Commands

- `pnpm dev`: Run all app(s) via Turborepo TUI.
- `pnpm web` / `pnpm native` / `pnpm backend`: Dev for a single target.
- `pnpm build`: Build all workspaces (Next/Expo/Convex as applicable).
- `pnpm lint`: Lint across the monorepo.
- `pnpm type-check`: TypeScript checks only.
- `pnpm format`: Prettier write across repo.
- Add deps to an app: `pnpm add <pkg> --filter web-app` (or use scripts `pnpm run add:web`, `add:native`, `add:backend`).

## Coding Style & Naming Conventions

- **Formatting**: Prettier (2 spaces, single quotes, no semicolons, no trailing commas; Tailwind plugin enabled).
- **Linting**: ESLint with TypeScript; `@typescript-eslint/no-unused-vars` warns; `any` allowed where pragmatic.
  - Type safety preferences for this repo:
    - Avoid `as any` and `as unknown` entirely. Do not use them to “fix” typing.
    - Avoid TypeScript directive hacks like `@ts-expect-error`/`@ts-ignore` to silence errors.
    - Prefer proper type inference via helpers, narrow interfaces, and generics.
    - Type casts (`as X`) are acceptable only with clear justification and as short-lived stop-gaps; favor refactoring APIs or adding helpers to eliminate them.
    - When Convex generics cause deep instantiation, prefer small, well-typed wrappers (helpers/codecs) over broad casts.
- **Components**: PascalCase files (`MyComponent.tsx`); hooks `useX.ts`; utility modules kebab-case.
- **Packages**: Scoped as `@packages/*`; prefer explicit exports and typed interfaces.

## Testing Guidelines

- Currently no test runner configured. Co-locate tests as `*.test.ts(x)` or `*.spec.ts(x)` next to code.
- Prefer Vitest or Jest; add a workspace-level `test` script and wire to Turborepo (`turbo run test`).
- Keep tests deterministic; stub network and Convex calls.

## Commit & Pull Request Guidelines

- **Commits**: Conventional Commits preferred (`feat:`, `fix:`, `chore:`, `wip:` common). Use imperative, concise subjects.
- **PRs**: Include purpose, scope, linked issues, screenshots for UI, and migration notes if env/Convex schema changes.
- **Checks**: Ensure `pnpm type-check && pnpm lint && pnpm build` pass for touched workspaces.

## Security & Configuration Tips

- **Env**: Do not commit secrets. Use `.env.local`. Convex keys: `CONVEX_DEPLOY_KEY`; URLs: `NEXT_PUBLIC_CONVEX_URL`.
- **Backend setup**: `npm run setup --workspace packages/backend` to initialize Convex locally.
- **Workspace hygiene**: Use `--filter` when adding deps to avoid cross-app bloat.
