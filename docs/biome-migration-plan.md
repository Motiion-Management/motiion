# Biome Migration Plan

This document outlines a pragmatic path to migrate the monorepo from ESLint/Prettier to Biome for linting and formatting while keeping type-checking with TypeScript and retaining any framework-specific checks where needed.

## Why Biome

- Monorepo-friendly: fast, consistent formatting + lint across packages.
- Simplifies toolchain: one tool for JS/TS/JSX/TSX lint + format.
- Sidesteps current ESLint parser/globby resolution issues.

Trade-offs:

- No ESLint plugin ecosystem (e.g., `eslint-config-next`, `react-hooks`).
- No native Tailwind class sorting like `prettier-plugin-tailwindcss`.
- Not a TypeScript type-checker (keep `tsc --noEmit`).

## Scope

- Add Biome at the repo root with a single `biome.json` that covers all workspaces.
- Replace existing `lint`/`format` scripts in each workspace to use Biome.
- Keep TypeScript checks via `tsc --noEmit`.
- Optionally keep framework-specific linters (e.g., `next lint`) and Tailwind sorting as separate scripts.

## Configuration

Root `biome.json` (proposed):

- Files: `"**/*.{js,jsx,ts,tsx,json,md}"`.
- Ignore: `**/node_modules/**`, `**/.next/**`, `**/dist/**`, `**/build/**`, `**/.turbo/**`.
- Formatter style to mirror current Prettier:
  - 2 spaces, single quotes, semicolons as-needed, no trailing commas.
- Linter rules (initial baseline to avoid churn; tighten later):
  - `style.organizeImports`: "warn"
  - `style.noNonNullAssertion`: "off" (zodvex currently uses `!`)
  - consider elevating to "error" once codebase is normalized.

## Scripts

Root `package.json` (proposed additions):

- `"lint": "turbo run lint"` (keep Turbo orchestration)
- `"format": "turbo run format"`
- Add devDep: `"@biomejs/biome"`.

Workspace scripts (proposed):

- `"lint": "biome check ."`
- `"lint:fix": "biome check --write ."`
- `"format": "biome format --write ."`
- Keep `"type-check": "tsc --noEmit"` where applicable.

Special cases:

- `apps/web` (Next.js): optionally add `"lint:next": "next lint"` to keep Next-specific rules.
- Tailwind sorting: if desired, add separate Prettier step with `prettier-plugin-tailwindcss` (e.g., `pnpm run tailwind:sort`) or accept losing class sorting.

## Rollout Steps

1. Add `@biomejs/biome` at root and create `biome.json`.
2. Update scripts across workspaces to use Biome for lint/format.
3. Keep `tsc --noEmit` type-check scripts.
4. Run `pnpm lint` and relax rules or apply fixes until green.
5. Optionally keep `next lint` in `apps/web` and Tailwind sorting step.
6. Remove unused ESLint + Prettier configs once stable (can be done in a follow-up PR).

## Open Questions

- Do we need Next.js ESLint rules in CI, or are framework errors caught in build/runtime? If yes, keep `next lint` as a separate task for `apps/web`.
- Do we want Tailwind class sorting enforced, or is `tw-merge`/manual style sufficient?

## Revert Path

This migration is reversible by restoring ESLint/Prettier scripts/configs and removing Biome. Keeping the ESLint configs in git history or a separate branch makes reverting straightforward.
