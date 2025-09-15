/*
Bridge for calling internal Convex functions from http.ts (and elsewhere)
without pulling heavy generic types into the callsite.

Toggle strategy:

- Default: dynamic bridge (safe). Keeps type-checking light and avoids
  deep generic instantiation (TS2589). Consumers get typed args.

- To try full static types: uncomment the STATIC section and comment out the
  DYNAMIC section. If typechecking regresses, switch back quickly.
*/

import type { ActionCtx } from './_generated/server'

// ===== DYNAMIC (default) =====
// eslint-disable-next-line @typescript-eslint/no-var-requires
const internal: any = require('./_generated/api').internal

// ===== STATIC (optional) =====
// import { internal } from './_generated/api' // Uncomment to try fully typed imports
// import type { FunctionReference } from 'convex/server'
// export const clerkFulfillRef = internal.clerk.fulfill as FunctionReference<
//   'action',
//   'internal',
//   { payload: string; headers: Record<string, string> },
//   any
// >
// export const updateOrCreateUserByTokenIdRef = internal.users
//   .updateOrCreateUserByTokenId as FunctionReference<
//   'mutation',
//   'internal',
//   {
//     data: {
//       tokenId: string
//       email?: string
//       firstName?: string
//       lastName?: string
//       phone?: string
//     }
//     eventType: 'user.created' | 'user.updated'
//   },
//   any
// >
// export const deleteUserByTokenIdRef = internal.users
//   .deleteUserByTokenId as FunctionReference<
//   'mutation',
//   'internal',
//   { tokenId: string },
//   any
// >

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

export async function getUserByTokenIdAction(
  ctx: HasRunAction,
  tokenId: string
) {
  return ctx.runAction((internal as any).users.getByTokenId, { tokenId })
}
