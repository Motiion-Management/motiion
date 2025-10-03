import {
  ActionCtx,
  MutationCtx,
  QueryCtx,
  action,
  mutation,
  query,
  internalQuery,
  internalMutation,
  internalAction
} from './_generated/server'
import { ConvexError } from 'convex/values'
import {
  createQueryBuilder,
  createMutationBuilder,
  createActionBuilder,
  zStrictQuery,
  zStrictMutation,
  zStrictAction,
  customCtx,
  zid
} from 'zodvex'
import * as chs from 'convex-helpers/server/customFunctions'
// Avoid depending on internal API function names here to reduce coupling
import { Id, Doc } from './_generated/dataModel'
import { internal } from './_generated/api'

// Re-export zodvex helpers
export { zid }

// Plain zodvex wrappers with our app's specific DataModel (type-safe by default)
// Using new simplified builder API for plain wrappers
export const zq = createQueryBuilder(query)
export const zm = createMutationBuilder(mutation)
export const za = createActionBuilder(action)
export const ziq = createQueryBuilder(internalQuery)
export const zim = createMutationBuilder(internalMutation)
export const zia = createActionBuilder(internalAction)

// Auth-wrapped builders using zStrict* + customCtx pattern
export const authQuery = zStrictQuery(
  query,
  customCtx(async (ctx: QueryCtx) => {
    try {
      return { user: await getUserOrThrow(ctx) }
    } catch (err) {
      return { user: null }
    }
  })
)

export const authMutation = zStrictMutation(
  mutation,
  customCtx(async (ctx: MutationCtx) => ({ user: await getUserOrThrow(ctx) }))
)

// Deprecated - use authMutation instead
export const zAuthMutation = authMutation

export const authAction = zStrictAction(
  action,
  customCtx(
    async (
      ctx: ActionCtx
    ): Promise<{
      user: {
        _id: Id<'users'>
        userId: string
        isPremium: boolean
      }
    }> => {
      const tokenId = (await ctx.auth.getUserIdentity())?.subject

      if (!tokenId) {
        throw new ConvexError('must be logged in')
      }

      const user: any = await ctx.runQuery(internal.users.users.getByTokenId, {
        tokenId
      })

      if (!user) {
        throw new ConvexError('user not found')
      }

      const _id: Id<'users'> = user._id
      const isPremium = (user as any).isPremium ?? false

      return {
        user: {
          _id,
          userId: tokenId,
          isPremium
        }
      }
    }
  )
)

export const adminAuthAction = zStrictAction(
  action,
  customCtx(
    async (
      ctx: ActionCtx
    ): Promise<{
      user: {
        _id: Id<'users'>
        tokenId: string
      }
    }> => {
      const tokenId = (await ctx.auth.getUserIdentity())?.subject

      if (!tokenId) {
        throw new ConvexError('must be logged in')
      }

      const user = await ctx.runQuery(internal.users.users.getByTokenId, {
        tokenId
      })

      if (!user) {
        throw new ConvexError('user not found')
      }

      if (!user.isAdmin) {
        throw new ConvexError('must be admin to run this action')
      }

      const _id: Id<'users'> = user._id

      return {
        user: {
          _id,
          tokenId
        }
      }
    }
  )
)

export const adminAuthMutation = zStrictMutation(
  mutation,
  customCtx(async (ctx: MutationCtx) => {
    const user = await getUserOrThrow(ctx)

    if (!user.isAdmin) {
      throw new ConvexError('must be admin to run this mutation')
    }

    return { user }
  })
)

async function getUserOrThrow(ctx: QueryCtx | MutationCtx) {
  const tokenId = (await ctx.auth.getUserIdentity())?.subject

  if (!tokenId) {
    console.error('must be logged in')
    throw new ConvexError('must be logged in')
  }

  const user = await ctx.db
    .query('users')
    .withIndex('tokenId', (q) => q.eq('tokenId', tokenId))
    .first()

  if (!user) {
    console.error('user not found')
    throw new ConvexError('user not found')
  }

  return user
}

export const getUser = async (ctx: QueryCtx | MutationCtx | ActionCtx) => {
  return await ctx.auth.getUserIdentity()
}

type RecursivelyReplaceNullWithUndefined<T> = T extends null
  ? undefined
  : T extends Date
  ? T
  : {
    [K in keyof T]: T[K] extends (infer U)[]
    ? RecursivelyReplaceNullWithUndefined<U>[]
    : RecursivelyReplaceNullWithUndefined<T[K]>
  }

export function nullsToUndefined<T>(
  obj: T
): RecursivelyReplaceNullWithUndefined<T> {
  if (obj === null) {
    return undefined as any
  }

  // object check based on: https://stackoverflow.com/a/51458052/6489012
  if (obj?.constructor.name === 'Object') {
    for (const key in obj) {
      obj[key] = nullsToUndefined(obj[key]) as any
    }
  }
  return obj as any
}

// type predicate filter by not null or undefined
export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined
}
