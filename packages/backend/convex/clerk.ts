'use node'

import type { WebhookEvent } from '@clerk/backend'
import { internalAction } from './_generated/server'
import { Webhook } from 'svix'
import { missingEnvVariableUrl } from 'convex-helpers/server'
import { zInternalAction } from 'zodvex'
import { z } from 'zod'

function ensureEnvironmentVariable(name: string): string {
  const value = process.env[name]
  if (value === undefined) {
    throw new Error(
      missingEnvVariableUrl(
        name,
        `https://dashboard.clerk.com/apps/app_2fcBUGE0wQbCQRMBYthYzibCnzP/instances/ins_2fcBUDh5l4LBRABwKkRn36x5mOu/webhooks`
      )
    )
  }
  return value!
}
const webhookSecret = ensureEnvironmentVariable('CLERK_WEBHOOK_SECRET')

export const fulfill = zInternalAction(
  internalAction,
  {
    headers: z
      .object({
        svixId: z.string().min(1),
        svixTimestamp: z.string().min(1),
        svixSignature: z.string().min(1)
      })
      .strict(),
    payload: z.string()
  },
  async (ctx, args) => {
    const wh = new Webhook(webhookSecret)
    const payload = wh.verify(args.payload, {
      'svix-id': args.headers.svixId,
      'svix-timestamp': args.headers.svixTimestamp,
      'svix-signature': args.headers.svixSignature
    }) as WebhookEvent
    return payload
  }
)
