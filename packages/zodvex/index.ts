import { z } from 'zod'
import { v, type Validator } from 'convex/values'
import {
  zodToConvex as baseZodToConvex,
  zodToConvexFields as baseZodToConvexFields
} from 'convex-helpers/server/zodV4'

// Helper type guard
const isUnion = (val: any) => val && typeof val === 'object' && val.kind === 'union'
const isNullValidator = (val: any) => val && typeof val === 'object' && val.kind === 'null'

function makeUnion(members: any[]): any {
  const nonNull = members.filter(Boolean)
  if (nonNull.length === 0) return v.any()
  if (nonNull.length === 1) return nonNull[0]
  return v.union(nonNull[0], nonNull[1], ...nonNull.slice(2))
}

function stripNullFromUnion(validator: any): { base: any; hadNull: boolean } {
  if (!isUnion(validator)) return { base: validator, hadNull: false }
  const keep = (validator.members || []).filter((m: any) => !isNullValidator(m))
  if (keep.length === (validator.members || []).length) {
    return { base: validator, hadNull: false }
  }
  return { base: makeUnion(keep), hadNull: true }
}

function analyzeZod(schema: z.ZodTypeAny): {
  base: z.ZodTypeAny
  optional: boolean
  nullable: boolean
  hasDefault: boolean
} {
  let s: z.ZodTypeAny = schema
  let optional = false
  let nullable = false
  let hasDefault = false

  // Handle default wrapping around optional
  if (s instanceof z.ZodDefault) {
    hasDefault = true
    s = s._def.innerType as z.ZodTypeAny
  }
  if (s instanceof z.ZodOptional) {
    optional = true
    s = s._def.innerType as z.ZodTypeAny
    // .optional().default() compiles to ZodDefault(ZodOptional(inner)) in v4 commonly
    if (s instanceof z.ZodDefault) {
      hasDefault = true
      s = s._def.innerType as z.ZodTypeAny
    }
  }
  if (s instanceof z.ZodNullable) {
    nullable = true
    s = s._def.innerType as z.ZodTypeAny
  } else if (s instanceof z.ZodUnion) {
    // Detect explicit union with null at the top level
    const opts = (s as z.ZodUnion<any>)._def.options as z.ZodTypeAny[]
    if (opts && opts.some((o) => o instanceof z.ZodNull)) {
      nullable = true
      // Keep as union for base analysis
    }
  }
  return { base: s, optional: optional || hasDefault, nullable, hasDefault }
}

export function zodToConvex(schema: z.ZodTypeAny): Validator<any, any, any> {
  // Use base conversion first (handles most Zod features)
  const conv = baseZodToConvex(schema) as any

  // Determine true optional/nullability from the original zod schema
  const meta = analyzeZod(schema)

  // Remove null from union when it's only representing optional
  const { base } = stripNullFromUnion(conv)

  // Rebuild per optional/nullable flags
  let rebuilt: any = base
  if (meta.nullable) {
    rebuilt = makeUnion([base, v.null()])
  }
  if (meta.optional) {
    rebuilt = v.optional(rebuilt)
  }
  return rebuilt
}

export function zodToConvexFields(
  shapeOrObject:
    | z.ZodRawShape
    | Record<string, z.ZodTypeAny>
    | z.ZodObject<any>
): Record<string, Validator<any, any, any>> {
  // Normalize input to a ZodRawShape-like object
  let shape: Record<string, z.ZodTypeAny>
  if (shapeOrObject && typeof (shapeOrObject as any)._def === 'object') {
    const asAny = shapeOrObject as any
    if (asAny._def?.typeName === 'ZodObject') {
      shape = (asAny._def.shape() ?? asAny.shape) as Record<string, z.ZodTypeAny>
    } else {
      throw new Error('Unsupported Zod type for zodToConvexFields; expected ZodObject or shape')
    }
  } else {
    shape = shapeOrObject as Record<string, z.ZodTypeAny>
  }

  // Start with base conversion for the whole shape
  const base = baseZodToConvexFields(shape) as Record<string, any>

  // Then correct optional/nullable semantics per field
  const out: Record<string, Validator<any, any, any>> = {}
  for (const [key, zodField] of Object.entries(shape)) {
    const meta = analyzeZod(zodField)
    const original = base[key] as any
    const { base: noNull } = stripNullFromUnion(original)
    let rebuilt: any = noNull
    if (meta.nullable) {
      rebuilt = makeUnion([noNull, v.null()])
    }
    if (meta.optional) {
      rebuilt = v.optional(rebuilt)
    }
    out[key] = rebuilt
  }
  return out
}

export default {
  zodToConvex,
  zodToConvexFields
}
