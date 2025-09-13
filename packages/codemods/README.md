Convex Helpers Codemods

- CLI to run codemods for migrating convex-helpers usage.
- First transform: rewrite imports from `convex-helpers/server/zod` to `convex-helpers/server/zodV4`.
- Designed to easily add more transforms for zod4 conversion.

Usage

- Local (recommended while unpublished):
  - Run on the whole repo: `pnpm --filter @packages/codemods start -- zod4-imports .`
  - Or via script alias: `pnpm --filter @packages/codemods codemod -- zod4-imports packages/backend`
  - Dry run: add `--dry`
  - Verbose: add `--verbose`
  - Extensions: `--extensions ts,tsx,js,jsx`

- As a bin (after publishing):
  - `npx @packages/codemods zod4-imports <path>`
  - Or installed: `convex-helpers-codemods zod4-imports <path>`

Examples

- Rewrite all imports in backend only:
  `pnpm --filter @packages/codemods start -- zod4-imports packages/backend`

- Preview changes (no writes):
  `pnpm --filter @packages/codemods start -- zod4-imports . --dry --verbose`

Transforms

- `zod4-imports`: Rewrites string literals in import/require/dynamic import lines
  from `convex-helpers/server/zod` to `convex-helpers/server/zodV4`.

Adding More Transforms

- Add a new file under `transforms/` exporting a default `transform(filePath, source)` function.
- Register nothing else; the CLI auto-discovers by filename.
- Example filename: `transforms/rename-foo-to-bar.js` and call via
  `... start -- rename-foo-to-bar <path>`

Notes

- The transform is conservative: it only rewrites lines containing `import`, `from`, or `require`.
- It supports `.ts,.tsx,.js,.jsx` by default.
- It skips common build directories like `node_modules`, `.next`, `dist`, `build`, `.turbo`, and `convex/_generated`.

