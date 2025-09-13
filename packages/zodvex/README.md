zodvex

Zod v4 → Convex validator mapping with correct optional vs nullable semantics. Designed as a thin compatibility layer around convex-helpers v4 while preserving Convex's notion of optional fields.

Why

- Convex treats optional object fields only when wrapped via `v.optional(...)`.
- Some mappers represent Zod `.optional()` as `v.union(T, v.null())`, which allows null but still requires the key.
- zodvex fixes this by post-processing validators per field to apply:
  - optional only → `v.optional(T)`
  - nullable only → `v.union(T, v.null())`
  - optional + nullable → `v.optional(v.union(T, v.null()))`

API

- Low-level mappers
  - `zodToConvex(z: ZodTypeAny): Validator`
  - `zodToConvexFields(shapeOrObject: ZodRawShape | Record<string, ZodTypeAny> | ZodObject<any>): Record<string, Validator>`

- Codec API
  - `convexCodec(schema)` → returns a codec with:
    - `toConvexSchema()` → Convex validators (object fields or a single validator)
    - `encode(data)` → zod-shaped data → Convex-friendly JSON (removes undefineds, dates→timestamps)
    - `decode(data)` → Convex record → zod-shaped data (timestamps→Date)
    - `pick({ key: true, ... })` → derive a sub-codec for a subset of fields (ZodObject only)

Usage

```ts
import { z } from 'zod'
import { Table } from 'convex-helpers/server'
import { zodToConvexFields } from '@packages/zodvex'

const agencies = {
  name: z.string(),
  managerList: z.array(z.string()).optional(), // becomes v.optional(v.array(v.string()))
}

export const Agencies = Table('agencies', zodToConvexFields(agencies))
```

Notes

- This package uses `convex-helpers/server/zodV4` for base conversions and adjusts optionals afterward.
- Transforms/brands fallback to the helper's behavior. If an output cannot be inferred, it remains `v.any()`.
- Defaults imply optional at the Convex schema level; apply runtime defaults in app code.

Codec notes
- `encode()` calls `schema.parse()` first, then converts to Convex-safe JSON (e.g., omits undefined, converts Date to timestamp). It’s safe to use before writes.
- `decode()` converts Convex JSON back to the Zod shape (e.g., timestamps to Date) for client usage.
- `toConvexSchema()` always derives validators from the codec’s input schema with correct optional/nullable semantics.
