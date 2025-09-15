/*
Bridge for calling internal Convex functions from http.ts using fully typed
FunctionReferences (STATIC). Intentionally avoids any/unknown.

If typechecking regresses (deep generic instantiation), we can temporarily
revert to a dynamic bridge by importing `internal` with a dynamic require
and returning typed functions. For now, we favor correctness and explicit types.
*/

import type { FunctionReference } from 'convex/server'
import { internal } from './_generated/api'

export const clerkFulfillRef = internal.clerk
  .fulfill as FunctionReference<
  'action',
  'internal',
  { payload: string; headers: Record<string, string> },
  any
>

export const updateOrCreateUserByTokenIdRef = internal.users
  .updateOrCreateUserByTokenId as FunctionReference<
  'mutation',
  'internal',
  {
    data: {
      tokenId: string
      email?: string
      firstName?: string
      lastName?: string
      phone?: string
    }
    eventType: 'user.created' | 'user.updated'
  },
  any
>

export const deleteUserByTokenIdRef = internal.users
  .deleteUserByTokenId as FunctionReference<
  'mutation',
  'internal',
  { tokenId: string },
  any
>
