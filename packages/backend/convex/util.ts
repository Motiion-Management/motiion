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
import { customCtx, customQuery, customMutation, NoOp } from 'convex-helpers/server/customFunctions'
import { ConvexError } from 'convex/values'
import { zCustomQuery, zCustomMutation, zCustomAction, zid } from '@packages/zodvex'
// Avoid depending on internal API function names here to reduce coupling
import { Id, Doc } from './_generated/dataModel'
import { internal } from './_generated/api'

// Re-export zodvex helpers
export { zid }

// Plain zodvex wrappers with our app's specific DataModel
export const zq = zCustomQuery(query, NoOp)
export const zm = zCustomMutation(mutation, NoOp)
export const za = zCustomAction(action, NoOp)
export const ziq = zCustomQuery(internalQuery, NoOp)
export const zim = zCustomMutation(internalMutation, NoOp)
export const zia = zCustomAction(internalAction, NoOp)

// Plain auth wrappers for use with crud() and other convex-helpers functions
export const plainAuthQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await getUserOrThrow(ctx)
    return { user }
  })
)

export const plainAuthMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await getUserOrThrow(ctx)
    return { user }
  })
)

// Auth-wrapped zodvex mutation
export const zAuthMutation = zCustomMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await getUserOrThrow(ctx)
    return { user }
  })
)

export const authQuery = zCustomQuery(
  query,
  customCtx(async (ctx) => {
    try {
      return { user: await getUserOrThrow(ctx) }
    } catch (err) {
      return { user: null }
    }
  })
)

export const authAction = zCustomAction(
  action,
  customCtx(
    async (
      ctx
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

      const user: any = await ctx.runQuery(internal.users.getByTokenId, {
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

export const authMutation = zCustomMutation(
  mutation,
  customCtx(async (ctx) => ({ user: await getUserOrThrow(ctx) }))
)

export const adminAuthAction = zCustomAction(
  action,
  customCtx(
    async (
      ctx
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

      const user = await ctx.runQuery(internal.users.getByTokenId, {
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

export const adminAuthMutation = zCustomMutation(
  mutation,
  customCtx(async (ctx) => {
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
