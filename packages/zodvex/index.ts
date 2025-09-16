import { z } from 'zod'
import {
  v,
  type Validator,
  type GenericValidator,
  type PropertyValidators,
  ConvexError
} from 'convex/values'
import {
  type GenericDataModel,
  type QueryBuilder,
  type MutationBuilder,
  type ActionBuilder,
  type GenericQueryCtx,
  type GenericMutationCtx,
  type GenericActionCtx,
  type FunctionVisibility,
  type RegisteredQuery,
  type RegisteredMutation,
  type RegisteredAction,
  type DefaultFunctionArgs,
  paginationOptsValidator
} from 'convex/server'
import { registryHelpers, zid } from 'convex-helpers/server/zodV4'
import { Table } from 'convex-helpers/server'
import {
  type CustomBuilder,
  type Customization,
  NoOp
} from 'convex-helpers/server/customFunctions'

function makeUnion(members: any[]): any {
  const nonNull = members.filter(Boolean)
  if (nonNull.length === 0) return v.any()
  if (nonNull.length === 1) return nonNull[0]
  return v.union(nonNull[0], nonNull[1], ...nonNull.slice(2))
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

  // Unwrap layers using public API and track flags
  while (
    s instanceof z.ZodDefault ||
    s instanceof z.ZodOptional ||
    s instanceof z.ZodNullable
  ) {
    if (s instanceof z.ZodDefault) hasDefault = true
    if (s instanceof z.ZodOptional) optional = true
    if (s instanceof z.ZodNullable) nullable = true
    const next = (s as any).unwrap?.() ?? s
    if (next === s) break
    s = next as z.ZodTypeAny
  }
  if (s instanceof z.ZodUnion) {
    // Detect explicit union with null at the top level
    const opts = (s as z.ZodUnion<any>).options as z.ZodTypeAny[]
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
  shapeOrObject: z.ZodRawShape | Record<string, z.ZodTypeAny> | z.ZodObject<any>
): Record<string, Validator<any, any, any>> {
  // Normalize input to a ZodRawShape-like object
  let shape: Record<string, z.ZodTypeAny>
  if (shapeOrObject instanceof z.ZodObject) {
    shape = getObjectShape(shapeOrObject as z.ZodObject<any>)
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

// Export all utilities and types
export default {
  zodToConvex,
  zodToConvexFields
}

// Re-export commonly used validators from convex-helpers
export { zid, type Zid } from 'convex-helpers/server/zodV4'

// Recursively rebuild validators to enforce optional vs nullable semantics and fix nested objects
function getObjectShape(obj: z.ZodObject<any>): Record<string, z.ZodTypeAny> {
  return (obj.shape || {}) as Record<string, z.ZodTypeAny>
}

function convertWithMeta(zodField: z.ZodTypeAny, baseValidator: any): any {
  const meta = analyzeZod(zodField)
  let core = baseValidator

  const inner = meta.base
  // Note: Avoid special-casing Zod v4 pipeline here to preserve registry metadata (e.g., zid)
  if (inner instanceof z.ZodObject) {
    const childShape = getObjectShape(inner as any)
    const baseChildren: Record<string, any> = Object.fromEntries(
      Object.entries(childShape).map(([k, v]) => [
        k,
        simpleToConvex(v as z.ZodTypeAny)
      ])
    )
    const rebuiltChildren: Record<string, any> = {}
    for (const [k, childZ] of Object.entries(childShape)) {
      rebuiltChildren[k] = convertWithMeta(childZ, baseChildren[k])
    }
    core = v.object(rebuiltChildren)
  } else if (inner instanceof z.ZodArray) {
    const elZod = (inner as z.ZodArray<any>).element as z.ZodTypeAny
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
  } catch { }

  // Handle primitives
  if (inner instanceof z.ZodString) return v.string()
  if (inner instanceof z.ZodNumber) return v.float64()
  if (inner instanceof z.ZodBigInt) return v.int64()
  if (inner instanceof z.ZodBoolean) return v.boolean()
  if (inner instanceof z.ZodDate) return v.float64()
  if (inner instanceof z.ZodNull) return v.null()
  if (inner instanceof z.ZodAny) return v.any()
  if (inner instanceof z.ZodUnknown) return v.any()
  if ((z as any).ZodNever && inner instanceof (z as any).ZodNever) return v.any()
  if ((z as any).ZodUndefined && inner instanceof (z as any).ZodUndefined) return v.any()

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
    const opts: z.ZodTypeAny[] = (inner as z.ZodUnion<any>).options
    const nonNull = opts.filter((o) => !(o instanceof z.ZodNull))
    const members = nonNull.map((o) => simpleToConvex(o))
    return makeUnion(members)
  }

  // Discriminated Union
  if (inner instanceof z.ZodDiscriminatedUnion) {
    const members = (inner as z.ZodDiscriminatedUnion<any, any>).options.map(
      (o: z.ZodTypeAny) => simpleToConvex(o)
    )
    return makeUnion(members)
  }

  // Array
  if (inner instanceof z.ZodArray) {
    const el = (inner as z.ZodArray<any>).element as z.ZodTypeAny
    return v.array(simpleToConvex(el))
  }

  // Object
  if (inner instanceof z.ZodObject) {
    const shape = getObjectShape(inner)
    const fields: Record<string, any> = {}
    for (const [k, child] of Object.entries(shape)) {
      fields[k] = convertWithMeta(
        child as z.ZodTypeAny,
        simpleToConvex(child as z.ZodTypeAny)
      )
    }
    return v.object(fields)
  }

  // Record
  if (inner instanceof z.ZodRecord) {
    const valueType = (inner as z.ZodRecord<any>).valueType as z.ZodTypeAny
    return v.record(v.string(), simpleToConvex(valueType))
  }

  // Tuple → approximate as an array of the union of item validators (length not enforced)
  if ((z as any).ZodTuple && inner instanceof (z as any).ZodTuple) {
    const items = ((inner as any)._def?.items ?? []) as z.ZodTypeAny[]
    const member = items.length ? makeUnion(items.map((i) => simpleToConvex(i))) : v.any()
    return v.array(member)
  }

  // Intersection of objects → merge fields (fallback to any otherwise)
  if ((z as any).ZodIntersection && inner instanceof (z as any).ZodIntersection) {
    const left = (inner as any)._def?.left as z.ZodTypeAny
    const right = (inner as any)._def?.right as z.ZodTypeAny
    if (left instanceof z.ZodObject && right instanceof z.ZodObject) {
      const l = getObjectShape(left)
      const r = getObjectShape(right)
      const keys = new Set([...Object.keys(l), ...Object.keys(r)])
      const fields: Record<string, any> = {}
      for (const k of keys) {
        const lz = l[k]
        const rz = r[k]
        if (lz && rz) {
          // union of validators for conflicting fields
          fields[k] = makeUnion([simpleToConvex(lz), simpleToConvex(rz)])
        } else {
          const zf = (lz || rz) as z.ZodTypeAny
          fields[k] = simpleToConvex(zf)
        }
      }
      return v.object(fields)
    }
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
    return toConvexJS((schema as any).unwrap(), value)
  }
  if (schema instanceof z.ZodOptional) {
    if (value === undefined) return undefined
    return toConvexJS((schema as any).unwrap(), value)
  }
  if (schema instanceof z.ZodNullable) {
    if (value === null) return null
    return toConvexJS((schema as any).unwrap(), value)
  }
  // Zod v4 pipeline (transform/preprocess): encode according to the output side
  // For pipelines (transforms), prefer encoding using the output side
  if (schema && schema.type === 'pipe' && 'out' in schema) {
    return toConvexJS(schema.out as z.ZodTypeAny, value)
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
    const el = (schema as z.ZodArray<any>).element as z.ZodTypeAny
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

  // Zod v4 pipeline (transform/preprocess): decode according to the output side
  if (
    (schema as any) &&
    (schema as any).type === 'pipe' &&
    'out' in (schema as any)
  ) {
    return fromConvexJS((schema as any).out as z.ZodTypeAny, value)
  }
  if (schema instanceof z.ZodDefault) {
    return fromConvexJS((schema as any).unwrap(), value)
  }
  if (schema instanceof z.ZodOptional) {
    if (value === undefined) return undefined
    return fromConvexJS((schema as any).unwrap(), value)
  }
  if (schema instanceof z.ZodNullable) {
    if (value === null) return null
    return fromConvexJS((schema as any).unwrap(), value)
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
    const el = (schema as z.ZodArray<any>).element as z.ZodTypeAny
    return value.map((item) => fromConvexJS(el, item))
  }

  if (schema instanceof z.ZodDate && typeof value === 'number') {
    return new Date(value)
  }

  return value
}

// (removed) Overwrite helper was unused

// Helper to pick specific keys from an object
function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  return result
}

// Improved type inference for Zod arguments
export type InferArgs<A> =
  A extends z.ZodObject<infer S>
  ? z.infer<z.ZodObject<S>>
  : A extends Record<string, z.ZodTypeAny>
  ? { [K in keyof A]: z.infer<A[K]> }
  : A extends z.ZodTypeAny
  ? z.infer<A>
  : Record<string, never>

// Type helper for return values
export type InferReturns<R> = R extends z.ZodTypeAny
  ? z.output<R>
  : R extends undefined
  ? any
  : R

// (removed) normalizeSchema no longer needed; wrappers normalize explicitly

// Convert Zod return validator to Convex validator
function zodReturnsToConvex(
  returns?: z.ZodTypeAny
): GenericValidator | undefined {
  if (!returns) return undefined
  return zodToConvex(returns)
}

// Extract context type from any builder
type ExtractCtx<Builder> = Builder extends {
  (fn: { handler: (ctx: infer Ctx, ...args: any[]) => any }): any
}
  ? Ctx
  : never

// Type helper for extracting the output type of a builder function while preserving return type
type PreserveReturnType<Builder, ArgsType, ReturnsType> =
  Builder extends QueryBuilder<infer DataModel, infer Visibility>
  ? RegisteredQuery<
    Visibility,
    ArgsType extends DefaultFunctionArgs ? ArgsType : DefaultFunctionArgs,
    Promise<ReturnsType>
  >
  : Builder extends MutationBuilder<infer DataModel, infer Visibility>
  ? RegisteredMutation<
    Visibility,
    ArgsType extends DefaultFunctionArgs ? ArgsType : DefaultFunctionArgs,
    Promise<ReturnsType>
  >
  : Builder extends ActionBuilder<infer DataModel, infer Visibility>
  ? RegisteredAction<
    Visibility,
    ArgsType extends DefaultFunctionArgs
    ? ArgsType
    : DefaultFunctionArgs,
    Promise<ReturnsType>
  >
  : Builder extends CustomBuilder<
    'query',
    infer CustomArgs,
    infer CustomCtx,
    infer MadeArgs,
    infer InputCtx,
    infer Visibility,
    infer ExtraArgs
  >
  ? RegisteredQuery<
    Visibility,
    ArgsType extends DefaultFunctionArgs
    ? ArgsType
    : DefaultFunctionArgs,
    Promise<ReturnsType>
  >
  : Builder extends CustomBuilder<
    'mutation',
    infer CustomArgs,
    infer CustomCtx,
    infer MadeArgs,
    infer InputCtx,
    infer Visibility,
    infer ExtraArgs
  >
  ? RegisteredMutation<
    Visibility,
    ArgsType extends DefaultFunctionArgs
    ? ArgsType
    : DefaultFunctionArgs,
    Promise<ReturnsType>
  >
  : Builder extends CustomBuilder<
    'action',
    infer CustomArgs,
    infer CustomCtx,
    infer MadeArgs,
    infer InputCtx,
    infer Visibility,
    infer ExtraArgs
  >
  ? RegisteredAction<
    Visibility,
    ArgsType extends DefaultFunctionArgs
    ? ArgsType
    : DefaultFunctionArgs,
    Promise<ReturnsType>
  >
  : Builder extends (...args: any[]) => any
  ? ReturnType<Builder>
  : never

// Helper to convert Zod args to Convex args format
type ZodToConvexArgs<A> =
  A extends z.ZodObject<infer Shape>
  ? { [K in keyof Shape]: any }
  : A extends Record<string, z.ZodTypeAny>
  ? { [K in keyof A]: any }
  : A extends z.ZodTypeAny
  ? { value: any }
  : Record<string, never>

// Internal function builder that handles both standard and custom builders
function customFnBuilder(
  builder: (args: any) => any,
  customization: Customization<any, any, any, any>
) {
  const customInput = customization.input ?? NoOp.input
  const inputArgs = customization.args ?? NoOp.args

  return function customBuilder(fn: any): any {
    const { args, handler = fn, returns: maybeObject, ...extra } = fn

    const returns =
      maybeObject && !(maybeObject instanceof z.ZodType)
        ? z.object(maybeObject)
        : maybeObject

    const returnValidator =
      returns && !fn.skipConvexValidation
        ? { returns: zodToConvex(returns) }
        : undefined

    if (args && !fn.skipConvexValidation) {
      let argsValidator = args
      if (argsValidator instanceof z.ZodType) {
        if (argsValidator instanceof z.ZodObject) {
          argsValidator = getObjectShape(argsValidator)
        } else {
          throw new Error(
            'Unsupported zod type as args validator: ' +
            argsValidator.constructor.name
          )
        }
      }
      const convexValidator = zodToConvexFields(argsValidator)
      return builder({
        args: {
          ...convexValidator,
          ...inputArgs
        },
        ...returnValidator,
        handler: async (ctx: any, allArgs: any) => {
          const added = await customInput(
            ctx,
            pick(allArgs, Object.keys(inputArgs)) as any,
            extra
          )
          const rawArgs = pick(allArgs, Object.keys(argsValidator))
          const parsed = z.object(argsValidator).safeParse(rawArgs)
          if (!parsed.success) {
            throw new ConvexError({
              ZodError: JSON.parse(
                JSON.stringify(parsed.error.flatten(), null, 2)
              )
            })
          }
          const result = await handler({ ...ctx, ...added }, parsed.data)
          if (returns && !fn.skipConvexValidation) {
            const validated = (returns as z.ZodTypeAny).parse(result)
            return toConvexJS(returns as z.ZodTypeAny, validated)
          }
          return result
        }
      })
    }
    // No args provided
    return builder({
      args: inputArgs,
      ...returnValidator,
      handler: async (ctx: any, allArgs: any) => {
        const added = await customInput(
          ctx,
          pick(allArgs, Object.keys(inputArgs)) as any,
          extra
        )
        const result = await handler({ ...ctx, ...added }, allArgs)
        if (returns && !fn.skipConvexValidation) {
          const validated = (returns as z.ZodTypeAny).parse(result)
          return toConvexJS(returns as z.ZodTypeAny, validated)
        }
        return result
      }
    })
  }
}

// Custom Query builder for custom contexts
export function zCustomQuery<
  CustomArgsValidator extends PropertyValidators,
  CustomCtx extends Record<string, any>,
  CustomMadeArgs extends Record<string, any>,
  Visibility extends FunctionVisibility,
  DataModel extends GenericDataModel
>(
  query: QueryBuilder<DataModel, Visibility>,
  customization: Customization<
    GenericQueryCtx<DataModel>,
    CustomArgsValidator,
    CustomCtx,
    CustomMadeArgs
  >
) {
  return customFnBuilder(query, customization) as CustomBuilder<
    'query',
    CustomArgsValidator,
    CustomCtx,
    CustomMadeArgs,
    GenericQueryCtx<DataModel>,
    Visibility,
    Record<string, any>
  >
}

// Custom Mutation builder for custom contexts
export function zCustomMutation<
  CustomArgsValidator extends PropertyValidators,
  CustomCtx extends Record<string, any>,
  CustomMadeArgs extends Record<string, any>,
  Visibility extends FunctionVisibility,
  DataModel extends GenericDataModel
>(
  mutation: MutationBuilder<DataModel, Visibility>,
  customization: Customization<
    GenericMutationCtx<DataModel>,
    CustomArgsValidator,
    CustomCtx,
    CustomMadeArgs
  >
) {
  return customFnBuilder(mutation, customization) as CustomBuilder<
    'mutation',
    CustomArgsValidator,
    CustomCtx,
    CustomMadeArgs,
    GenericMutationCtx<DataModel>,
    Visibility,
    Record<string, any>
  >
}

// Custom Action builder for custom contexts
export function zCustomAction<
  CustomArgsValidator extends PropertyValidators,
  CustomCtx extends Record<string, any>,
  CustomMadeArgs extends Record<string, any>,
  Visibility extends FunctionVisibility,
  DataModel extends GenericDataModel
>(
  action: ActionBuilder<DataModel, Visibility>,
  customization: Customization<
    GenericActionCtx<DataModel>,
    CustomArgsValidator,
    CustomCtx,
    CustomMadeArgs
  >
) {
  return customFnBuilder(action, customization) as CustomBuilder<
    'action',
    CustomArgsValidator,
    CustomCtx,
    CustomMadeArgs,
    GenericActionCtx<DataModel>,
    Visibility,
    Record<string, any>
  >
}

// Query function for any builder type
export function zQuery<
  Builder extends (fn: any) => any,
  A extends z.ZodTypeAny | Record<string, z.ZodTypeAny>,
  R extends z.ZodTypeAny | undefined = undefined
>(
  query: Builder,
  input: A,
  handler: (
    ctx: ExtractCtx<Builder>,
    args: InferArgs<A>
  ) => Promise<InferReturns<R>> | InferReturns<R>,
  options?: { returns?: R }
): PreserveReturnType<Builder, ZodToConvexArgs<A>, InferReturns<R>> {
  let zod: z.ZodTypeAny
  let args: Record<string, any>
  if (input instanceof z.ZodObject) {
    zod = input
    args = zodToConvexFields(getObjectShape(input))
  } else if (input instanceof z.ZodType) {
    zod = z.object({ value: input as z.ZodTypeAny })
    args = { value: zodToConvex(input as z.ZodTypeAny) }
  } else {
    zod = z.object(input as Record<string, z.ZodTypeAny>)
    args = zodToConvexFields(input as Record<string, z.ZodTypeAny>)
  }
  const returns = options?.returns
    ? zodReturnsToConvex(options.returns)
    : undefined

  return query({
    args,
    returns,
    handler: async (ctx: ExtractCtx<Builder>, argsObject: unknown) => {
      const parsed = zod.parse(argsObject) as InferArgs<A>
      const raw = await handler(ctx, parsed)
      if (options?.returns) {
        const validated = (options.returns as z.ZodTypeAny).parse(raw)
        return toConvexJS(options.returns as z.ZodTypeAny, validated)
      }
      return raw as any
    }
  }) as PreserveReturnType<Builder, ZodToConvexArgs<A>, InferReturns<R>>
}

// Internal query
export function zInternalQuery<
  Builder extends (fn: any) => any,
  A extends z.ZodTypeAny | Record<string, z.ZodTypeAny>,
  R extends z.ZodTypeAny | undefined = undefined
>(
  internalQuery: Builder,
  input: A,
  handler: (
    ctx: ExtractCtx<Builder>,
    args: InferArgs<A>
  ) => Promise<InferReturns<R>> | InferReturns<R>,
  options?: { returns?: R }
): PreserveReturnType<Builder, ZodToConvexArgs<A>, InferReturns<R>> {
  return zQuery(internalQuery, input, handler, options)
}

// Mutation function for any builder type
export function zMutation<
  Builder extends (fn: any) => any,
  A extends z.ZodTypeAny | Record<string, z.ZodTypeAny>,
  R extends z.ZodTypeAny | undefined = undefined
>(
  mutation: Builder,
  input: A,
  handler: (
    ctx: ExtractCtx<Builder>,
    args: InferArgs<A>
  ) => Promise<InferReturns<R>> | InferReturns<R>,
  options?: { returns?: R }
): PreserveReturnType<Builder, ZodToConvexArgs<A>, InferReturns<R>> {
  let zod: z.ZodTypeAny
  let args: Record<string, any>
  if (input instanceof z.ZodObject) {
    zod = input
    args = zodToConvexFields(getObjectShape(input))
  } else if (input instanceof z.ZodType) {
    zod = z.object({ value: input as z.ZodTypeAny })
    args = { value: zodToConvex(input as z.ZodTypeAny) }
  } else {
    zod = z.object(input as Record<string, z.ZodTypeAny>)
    args = zodToConvexFields(input as Record<string, z.ZodTypeAny>)
  }
  const returns = options?.returns
    ? zodReturnsToConvex(options.returns)
    : undefined

  return mutation({
    args,
    returns,
    handler: async (ctx: ExtractCtx<Builder>, argsObject: unknown) => {
      const parsed = zod.parse(argsObject) as InferArgs<A>
      const raw = await handler(ctx, parsed)
      if (options?.returns) {
        const validated = (options.returns as z.ZodTypeAny).parse(raw)
        return toConvexJS(options.returns as z.ZodTypeAny, validated)
      }
      return raw as any
    }
  }) as PreserveReturnType<Builder, ZodToConvexArgs<A>, InferReturns<R>>
}

// Internal mutation
export function zInternalMutation<
  Builder extends (fn: any) => any,
  A extends z.ZodTypeAny | Record<string, z.ZodTypeAny>,
  R extends z.ZodTypeAny | undefined = undefined
>(
  internalMutation: Builder,
  input: A,
  handler: (
    ctx: ExtractCtx<Builder>,
    args: InferArgs<A>
  ) => Promise<InferReturns<R>> | InferReturns<R>,
  options?: { returns?: R }
): PreserveReturnType<Builder, ZodToConvexArgs<A>, InferReturns<R>> {
  return zMutation(internalMutation, input, handler, options)
}

// Action function for any builder type
export function zAction<
  Builder extends (fn: any) => any,
  A extends z.ZodTypeAny | Record<string, z.ZodTypeAny>,
  R extends z.ZodTypeAny | undefined = undefined
>(
  action: Builder,
  input: A,
  handler: (
    ctx: ExtractCtx<Builder>,
    args: InferArgs<A>
  ) => Promise<InferReturns<R>> | InferReturns<R>,
  options?: { returns?: R }
): PreserveReturnType<Builder, ZodToConvexArgs<A>, InferReturns<R>> {
  let zod: z.ZodTypeAny
  let args: Record<string, any>
  if (input instanceof z.ZodObject) {
    zod = input
    args = zodToConvexFields(getObjectShape(input))
  } else if (input instanceof z.ZodType) {
    zod = z.object({ value: input as z.ZodTypeAny })
    args = { value: zodToConvex(input as z.ZodTypeAny) }
  } else {
    zod = z.object(input as Record<string, z.ZodTypeAny>)
    args = zodToConvexFields(input as Record<string, z.ZodTypeAny>)
  }
  const returns = options?.returns
    ? zodReturnsToConvex(options.returns)
    : undefined

  return action({
    args,
    returns,
    handler: async (ctx: ExtractCtx<Builder>, argsObject: unknown) => {
      const parsed = zod.parse(argsObject) as InferArgs<A>
      const raw = await handler(ctx, parsed)
      if (options?.returns) {
        const validated = (options.returns as z.ZodTypeAny).parse(raw)
        return toConvexJS(options.returns as z.ZodTypeAny, validated)
      }
      return raw as any
    }
  }) as PreserveReturnType<Builder, ZodToConvexArgs<A>, InferReturns<R>>
}

// Internal action
export function zInternalAction<
  Builder extends (fn: any) => any,
  A extends z.ZodTypeAny | Record<string, z.ZodTypeAny>,
  R extends z.ZodTypeAny | undefined = undefined
>(
  internalAction: Builder,
  input: A,
  handler: (
    ctx: ExtractCtx<Builder>,
    args: InferArgs<A>
  ) => Promise<InferReturns<R>> | InferReturns<R>,
  options?: { returns?: R }
): PreserveReturnType<Builder, ZodToConvexArgs<A>, InferReturns<R>> {
  return zAction(internalAction, input, handler, options)
}

// Table creation with integrated codec support
export function zodTable<T extends z.ZodObject<any>, TableName extends string>(
  name: TableName,
  schema: T
) {
  const codec = convexCodec(schema)
  const tableDefinition = Table(name, codec.toConvexSchema())

  return {
    ...tableDefinition,
    codec, // Expose codec for encode/decode operations
    schema // Expose original Zod schema for reference
  }
}

// CRUD operations with zodvex patterns
export function zCrud<
  TableDefinition extends ReturnType<typeof zodTable>,
  QueryBuilder extends (fn: any) => any,
  MutationBuilder extends (fn: any) => any
>(
  table: TableDefinition,
  queryBuilder: QueryBuilder,
  mutationBuilder: MutationBuilder
) {
  const tableName = table.name
  const tableSchema = table.schema

  // Extract the shape for partial updates
  const shape = getObjectShape(tableSchema)

  return {
    create: zMutation(mutationBuilder, shape, async (ctx: any, args) => {
      return await ctx.db.insert(tableName, args)
    }),

    read: zQuery(
      queryBuilder,
      { id: zid(tableName) },
      async (ctx: any, { id }) => {
        return await ctx.db.get(id)
      }
    ),

    paginate: queryBuilder({
      args: { paginationOpts: paginationOptsValidator },
      handler: async (ctx: any, { paginationOpts }: any) => {
        return await ctx.db.query(tableName).paginate(paginationOpts)
      }
    }),

    update: zMutation(
      mutationBuilder,
      {
        id: zid(tableName),
        patch: z.object(shape).partial()
      },
      async (ctx: any, { id, patch }) => {
        await ctx.db.patch(id, patch)
      }
    ),

    destroy: zMutation(
      mutationBuilder,
      { id: zid(tableName) },
      async (ctx: any, { id }) => {
        const doc = await ctx.db.get(id)
        if (doc) {
          await ctx.db.delete(id)
        }
        return doc
      }
    )
  }
}
