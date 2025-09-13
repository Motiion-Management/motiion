import { z } from 'zod'
import { v, type Validator } from 'convex/values'
import { registryHelpers } from 'convex-helpers/server/zodV4'

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
  return convertWithMeta(schema, simpleToConvex(schema))
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

  // Build validators per field using our simple mapper and normalize recursively
  const out: Record<string, Validator<any, any, any>> = {}
  for (const [key, zodField] of Object.entries(shape)) {
    out[key] = convertWithMeta(zodField, simpleToConvex(zodField))
  }
  return out
}

export default {
  zodToConvex,
  zodToConvexFields
}

// Recursively rebuild validators to enforce optional vs nullable semantics and fix nested objects
function getObjectShape(obj: z.ZodObject<any>): Record<string, z.ZodTypeAny> {
  const anyObj: any = obj as any
  const def = anyObj._def
  if (def && typeof def.shape === 'function') {
    return def.shape()
  }
  if (typeof anyObj.shape === 'function') {
    return anyObj.shape()
  }
  if (def && def.shape) {
    return def.shape as Record<string, z.ZodTypeAny>
  }
  return (anyObj.shape || {}) as Record<string, z.ZodTypeAny>
}

function convertWithMeta(zodField: z.ZodTypeAny, baseValidator: any): any {
  const meta = analyzeZod(zodField)
  let core = stripNullFromUnion(baseValidator).base

  const inner = meta.base
  if (inner instanceof z.ZodObject) {
    const childShape = getObjectShape(inner as any)
    const baseChildren: Record<string, any> = Object.fromEntries(
      Object.entries(childShape).map(([k, v]) => [k, simpleToConvex(v as z.ZodTypeAny)])
    )
    const rebuiltChildren: Record<string, any> = {}
    for (const [k, childZ] of Object.entries(childShape)) {
      rebuiltChildren[k] = convertWithMeta(childZ, baseChildren[k])
    }
    core = v.object(rebuiltChildren)
  } else if (inner instanceof z.ZodArray) {
    const elZod = (inner._def as any).type as z.ZodTypeAny
    const baseEl = simpleToConvex(elZod)
    const rebuiltEl = convertWithMeta(elZod, baseEl)
    core = v.array(rebuiltEl)
  }

  if (meta.nullable) {
    core = makeUnion([core, v.null()])
  }
  if (meta.optional) {
    core = v.optional(core)
  }
  return core
}

// Minimal Zod v4 -> Convex mapping that avoids base converter to prevent runtime registry issues
function simpleToConvex(schema: z.ZodTypeAny): any {
  const meta = analyzeZod(schema)
  const inner = meta.base

  // Detect zid via registry metadata
  try {
    const m = registryHelpers.getMetadata(inner as any)
    if (m?.isConvexId && m?.tableName && typeof m.tableName === 'string') {
      return v.id(m.tableName)
    }
  } catch {}

  // Handle primitives
  if (inner instanceof z.ZodString) return v.string()
  if (inner instanceof z.ZodNumber) return v.float64()
  if (inner instanceof z.ZodBigInt) return v.int64()
  if (inner instanceof z.ZodBoolean) return v.boolean()
  if (inner instanceof z.ZodDate) return v.float64()
  if (inner instanceof z.ZodNull) return v.null()

  // Literal
  if (inner instanceof z.ZodLiteral) {
    return v.literal((inner as any).value)
  }

  // Enum
  if (inner instanceof z.ZodEnum) {
    const lits = (inner as any).options.map((opt: any) => v.literal(opt))
    return makeUnion(lits)
  }

  // Union
  if (inner instanceof z.ZodUnion) {
    const opts: z.ZodTypeAny[] = (inner as any)._def.options
    const members = opts.map((o) => simpleToConvex(o))
    return makeUnion(members)
  }

  // Array
  if (inner instanceof z.ZodArray) {
    const el = (inner._def as any).type as z.ZodTypeAny
    return v.array(simpleToConvex(el))
  }

  // Object
  if (inner instanceof z.ZodObject) {
    const shape = getObjectShape(inner)
    const fields: Record<string, any> = {}
    for (const [k, child] of Object.entries(shape)) {
      fields[k] = convertWithMeta(child as z.ZodTypeAny, simpleToConvex(child as z.ZodTypeAny))
    }
    return v.object(fields)
  }

  // Record
  if (inner instanceof z.ZodRecord) {
    const valueType = (inner._def as any).valueType as z.ZodTypeAny
    return v.record(v.string(), simpleToConvex(valueType))
  }

  // Fallback
  return v.any()
}

// Codec API
export type ConvexCodec<T = any> = {
  schema: z.ZodTypeAny
  toConvexSchema: () => any
  encode: (data: T) => any
  decode: (data: any) => T
  pick: (keys: Record<string, true>) => ConvexCodec<any>
}

export function convexCodec<T = any>(schema: z.ZodTypeAny): ConvexCodec<T> {
  const toConvexSchema = () => {
    if (schema instanceof z.ZodObject) {
      const shape = getObjectShape(schema)
      return zodToConvexFields(shape)
    }
    return zodToConvex(schema)
  }

  const encode = (data: any) => {
    const parsed = schema.parse(data)
    return toConvexJS(schema, parsed)
  }

  const decode = (data: any) => {
    return fromConvexJS(schema, data)
  }

  const pick = (keys: Record<string, true>): ConvexCodec<any> => {
    if (!(schema instanceof z.ZodObject)) {
      throw new Error('pick() is only supported on ZodObject schemas')
    }
    const picked = (schema as z.ZodObject<any>).pick(keys as any)
    return convexCodec(picked)
  }

  return { schema, toConvexSchema, encode, decode, pick }
}

// Convert a JS value parsed by Zod to a Convex-friendly JSON value based on schema
function toConvexJS(schema: z.ZodTypeAny, value: any): any {
  if (value === undefined) return undefined

  // unwrap default/optional/nullable
  if (schema instanceof z.ZodDefault) {
    return toConvexJS(schema._def.innerType as z.ZodTypeAny, value)
  }
  if (schema instanceof z.ZodOptional) {
    if (value === undefined) return undefined
    return toConvexJS(schema._def.innerType as z.ZodTypeAny, value)
  }
  if (schema instanceof z.ZodNullable) {
    if (value === null) return null
    return toConvexJS(schema._def.innerType as z.ZodTypeAny, value)
  }

  // objects
  if (schema instanceof z.ZodObject && value && typeof value === 'object') {
    const shape = getObjectShape(schema)
    const out: any = {}
    for (const [k, child] of Object.entries(shape)) {
      const v = toConvexJS(child, value[k])
      if (v !== undefined) out[k] = v // omit undefined
    }
    return out
  }

  // arrays
  if (schema instanceof z.ZodArray && Array.isArray(value)) {
    const el = (schema._def as any).type as z.ZodTypeAny
    return value.map((item) => toConvexJS(el, item))
  }

  // date → timestamp
  if (schema instanceof z.ZodDate && value instanceof Date) {
    return value.getTime()
  }

  // pass-through
  return value
}

// Convert a Convex JSON value to a shape consumable by the Zod schema
function fromConvexJS(schema: z.ZodTypeAny, value: any): any {
  if (value === undefined) return undefined

  if (schema instanceof z.ZodDefault) {
    return fromConvexJS(schema._def.innerType as z.ZodTypeAny, value)
  }
  if (schema instanceof z.ZodOptional) {
    if (value === undefined) return undefined
    return fromConvexJS(schema._def.innerType as z.ZodTypeAny, value)
  }
  if (schema instanceof z.ZodNullable) {
    if (value === null) return null
    return fromConvexJS(schema._def.innerType as z.ZodTypeAny, value)
  }

  if (schema instanceof z.ZodObject && value && typeof value === 'object') {
    const shape = getObjectShape(schema)
    const out: any = {}
    for (const [k, child] of Object.entries(shape)) {
      if (k in value) out[k] = fromConvexJS(child, (value as any)[k])
    }
    return out
  }

  if (schema instanceof z.ZodArray && Array.isArray(value)) {
    const el = (schema._def as any).type as z.ZodTypeAny
    return value.map((item) => fromConvexJS(el, item))
  }

  if (schema instanceof z.ZodDate && typeof value === 'number') {
    return new Date(value)
  }

  return value
}
