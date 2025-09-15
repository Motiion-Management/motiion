import type { ActionCtx } from './_generated/server'
// Use dynamic require to avoid deep generic instantiation in types
// eslint-disable-next-line @typescript-eslint/no-var-requires
const internal: any = require('./_generated/api').internal

type HasRunAction = Pick<ActionCtx, 'runAction'>
type HasRunMutation = Pick<ActionCtx, 'runMutation'>

export async function clerkFulfill(
  ctx: HasRunAction,
  args: { payload: string; headers: Record<string, string> }
) {
  return ctx.runAction((internal as any).clerk.fulfill, args)
}

export async function updateOrCreateUserByTokenId(
  ctx: HasRunMutation,
  args: {
    data: {
      tokenId: string
      email?: string
      firstName?: string
      lastName?: string
      phone?: string
    }
    eventType: 'user.created' | 'user.updated'
  }
) {
  return ctx.runMutation(
    (internal as any).users.updateOrCreateUserByTokenId,
    args
  )
}

export async function deleteUserByTokenId(
  ctx: HasRunMutation,
  args: { tokenId: string }
) {
  return ctx.runMutation((internal as any).users.deleteUserByTokenId, args)
}
