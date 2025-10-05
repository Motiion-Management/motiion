# Zodvex Migration Plan (Backend)

This document captures the next steps to fully migrate backend schemas and functions to the zodvex + codec pattern, and provides notes for hand-off to other developers.

## Goals

- Use a single source of truth (Zod) for all table shapes via codecs.
- Ensure optional vs nullable semantics map correctly to Convex validators.
- Validate Convex function args with Zod at the boundary for strong types + DX.
- Avoid deep generic instantiation problems by using small bridges or typed wrappers where necessary.

## 1) Tables → Codecs

Per table (e.g., Agencies, Projects, Training):

1. Define a Zod object for the table shape (e.g., `zAgencies = z.object(agencies)`).
2. Create a codec from that Zod object:
   ```ts
   import { convexCodec } from 'zodvex'
   export const AgenciesCodec = convexCodec(zAgencies)
   ```
3. Replace `Table('agencies', zodToConvexFields(agencies))` with:
   ```ts
   export const Agencies = Table('agencies', AgenciesCodec.toConvexSchema())
   ```

Notes:

- The codec applies deep normalization so optionals become `v.optional(...)` and nullables become `v.union(T, v.null())` recursively.
- Keep using `zid('table')` from `convex-helpers/server/zodV4` for ID fields inside Zod schemas.

## 2) Functions → zodvex wrappers

For every Convex function, use zodvex’s typed wrappers to define args with Zod and parse them at runtime:

- Queries:

  ```ts
  import { zQuery } from 'zodvex'
  export const myQuery = zQuery(
    query,
    { id: z.string() },
    async (ctx, { id }) => {
      // ...
    }
  )
  ```

- Mutations:

  ```ts
  import { zMutation } from 'zodvex'
  export const myMutation = zMutation(
    mutation,
    z.object({ name: z.string() }),
    async (ctx, args) => {
      // ...
    }
  )
  ```

- Internal functions:

  ```ts
  import { zInternalQuery, zInternalMutation } from 'zodvex'
  export const myInternalQuery = zInternalQuery(
    internalQuery,
    { key: z.string() },
    async (ctx, { key }) => {
      /* ... */
    }
  )
  export const myInternalMutation = zInternalMutation(
    internalMutation,
    { key: z.string() },
    async (ctx, { key }) => {
      /* ... */
    }
  )
  ```

- Auth-aware functions (where ctx.user is required): keep using our `authQuery/authMutation` from `util.ts` as the builder passed to `zQuery/zMutation`, e.g.:
  ```ts
  export const updateMyUser = zMutation(
    authMutation,
    zUsers.partial(),
    async (ctx, args) => {
      /* ... */
    }
  )
  ```

### Returns (optional enhancement)

We can extend the wrappers to accept a Zod return schema, which would:

- Add a Convex `returns` validator derived from Zod.
- Parse outbound values with Zod before returning.

This is not required to adopt the wrappers, but recommended for critical endpoints.

## 3) Notes for hand-off

### Migration steps (repeat across modules)

- Convert all tables to codecs:
  - `const Codec = convexCodec(z.object(shape))`
  - `Table('name', Codec.toConvexSchema())`
- Replace `zodToConvex`/`zodToConvexFields` usages in function args with zodvex wrappers:
  - Use Zod schemas or shapes directly for `args`.
  - Use `zid('table')` for Id fields.
- Keep auth context via `authQuery/authMutation` and use them as the base builders for zodvex wrappers.

### Optional vs nullable

- zodvex ensures:
  - `.optional()` → `v.optional(T)`
  - `.nullable()` → `v.union(T, v.null())`
  - optional + nullable → `v.optional(v.union(T, v.null()))`
- Applies recursively to nested objects and arrays of objects.

### Avoid deep generic instantiation (TS2589)

- Prefer zodvex wrappers and plain `ctx.db` calls within the same context.
- If a route (e.g., http.ts) must call internal functions and triggers TS2589,
  use a small bridge module (see `convex/apiBridge.ts`) to keep call sites typed
  without dragging heavy `internal.*` types into the route.
- The bridge file includes a toggle (dynamic vs static) so you can try fully typed
  refs and switch back quickly if type-checking regresses.

### Sanity script (optional)

- Add a script to walk generated table validators and flag any nested `union(
T, null)` under object fields that are not wrapped in `v.optional(...)`.
- Run once after migration to catch any missed optional fields.

## Checklist

- [ ] Convert Agencies to codec + zodvex wrappers
- [ ] Convert Projects to codec + zodvex wrappers
- [ ] Convert Training to codec + zodvex wrappers
- [ ] Replace remaining function args with zodvex wrappers
- [ ] Add return schemas to prioritized functions (optional)
- [ ] Try STATIC mode in `apiBridge.ts` (fully typed imports); keep if TS stays green
- [ ] Add sanity script for optional/null checks

## Examples (copy-paste)

Table via codec:

```ts
const agencies = { name: z.string(), listed: z.boolean().optional() /* ... */ }
export const zAgencies = z.object(agencies)
export const AgenciesCodec = convexCodec(zAgencies)
export const Agencies = Table('agencies', AgenciesCodec.toConvexSchema())
```

Mutation via zodvex + auth:

```ts
export const updateMyProfile = zMutation(
  authMutation,
  { displayName: z.string().optional(), location: zLocation.optional() },
  async (ctx, args) => {
    await ctx.db.patch(ctx.user._id, args)
  }
)
```

Internal query via zodvex:

```ts
export const getByTokenId = zInternalQuery(
  internalQuery,
  { tokenId: z.string() },
  async (ctx, { tokenId }) => {
    return await ctx.db
      .query('users')
      .withIndex('tokenId', (q: any) => q.eq('tokenId', tokenId))
      .first()
  }
)
```

Bridge toggle (apiBridge.ts):

```ts
// Default: dynamic (safe)
const internal: any = require('./_generated/api').internal

// Optional: fully typed (uncomment to try)
// import { internal } from './_generated/api'
// import type { FunctionReference } from 'convex/server'
// export const clerkFulfillRef = internal.clerk.fulfill as FunctionReference<...>
```
