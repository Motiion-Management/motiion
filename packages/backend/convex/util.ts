import {
  ActionCtx,
  MutationCtx,
  QueryCtx,
  action,
  mutation
} from './_generated/server'
import {
  customQuery,
  customCtx,
  customMutation,
  customAction
} from 'convex-helpers/server/customFunctions'
import { query } from './_generated/server'
import { ConvexError } from 'convex/values'
import { internal } from './_generated/api'
import { Id } from './_generated/dataModel'

export const authQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    try {
      return { user: await getUserOrThrow(ctx) }
    } catch (err) {
      return { user: null }
    }
  })
)

export const authAction = customAction(
  action,
  customCtx(async (ctx) => {
    const tokenId = (await ctx.auth.getUserIdentity())?.subject

    if (!tokenId) {
      throw new ConvexError('must be logged in')
    }

    const user: any = await ctx.runQuery(internal.users.getUserByTokenId, {
      tokenId
    })

    if (!user) {
      throw new ConvexError('user not found')
    }

    const _id: Id<'users'> = user._id
    const isPremium: boolean = user.isPremium

    return {
      user: {
        _id,
        userId: tokenId,
        isPremium
      }
    }
  })
)

export const authMutation = customMutation(
  mutation,
  customCtx(async (ctx) => ({ user: await getUserOrThrow(ctx) }))
)

export const adminAuthAction = customAction(
  action,
  customCtx(async (ctx) => {
    const tokenId = (await ctx.auth.getUserIdentity())?.subject

    if (!tokenId) {
      throw new ConvexError('must be logged in')
    }

    const user: any = await ctx.runQuery(internal.users.getUserByTokenId, {
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
  })
)

export const adminAuthMutation = customMutation(
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
