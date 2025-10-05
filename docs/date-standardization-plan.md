# Date Field Standardization (Prepared, Deferred)

This document captures the plan and current status for standardizing backend date fields to `z.date()` and Convex timestamps, along with the migration utilities that have been added but are not active yet.

## Current State (Strings)

- Projects schema stores dates as strings:
  - `packages/backend/convex/schemas/projects.ts:45`
  - `packages/backend/convex/schemas/projects.ts:46`
- Events schema stores dates as strings (including nested `timeline`):
  - `packages/backend/convex/schemas/events.ts:14`
  - `packages/backend/convex/schemas/events.ts:15`
  - `packages/backend/convex/schemas/events.ts:23`

Frontend (native):

- Date picker accepts Date objects and also gracefully parses legacy string/number values for display:
  - `apps/native/components/form/DatePickerField.tsx:27`
  - `apps/native/components/form/ConvexDynamicForm.tsx:287`

## Migration Utilities (Added, Do Not Run Yet)

- Internal mutation that converts `projects` date strings (yyyy-MM-dd or ISO) to timestamps (ms):
  - `packages/backend/convex/migrations/migrateDates.ts:24`
- Public action wrapper to trigger the internal mutation:
  - `packages/backend/convex/admin/runMigrations.ts:6`

Note: Events migration is intentionally disabled in `migrateDates.ts` (commented section) since we continue to store them as strings for now.

## Why Deferred

- Nothing in the backend currently uses `z.date()`. To avoid unnecessary churn and type changes across function signatures and doc types, we are keeping date fields as strings until we explicitly decide to flip.

## When We Decide to Flip to `z.date()`

1. Update schemas to `z.date()`:
   - `projects.startDate`, `projects.endDate` → `z.date()`
   - (Optional later) `events` top-level and `timeline` → `z.date()`
2. Switch frontend submit encoding to use `convexCodec`:
   - Replace `normalizeForConvex(...)` with `convexCodec(zProjectsDoc).encode(...)` in
     - `apps/native/components/projects/ProjectEditForm.tsx:114`
3. Run the migration action once to backfill historical data:
   - `admin/runMigrations.ts::runMigrateDates`
4. Remove any transitional handling and re-run `pnpm typecheck`.

## Additional Improvements Already Landed

- Zod v4‑only form introspection improvements:
  - Deep unwrapping for v4 pipelines/brands/optionals (`unwrapAll`)
  - Reliable Convex ID detection via zodvex registry and `_tableName`
  - Support for `ZodInterface` shapes
  - Better required vs nullable semantics; detection of `string().datetime()`
  - Files:
    - `apps/native/utils/zodSafeAccess.ts`
    - `apps/native/utils/convexSchemaToForm.ts`

## Summary

- Dates remain strings in backend schemas today. A safe migration path and action are in place but should not be invoked until we explicitly choose to standardize on `z.date()`.
