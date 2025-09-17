'use node'

import type { WebhookEvent } from '@clerk/backend'
import { internalAction } from './_generated/server'
import { Webhook } from 'svix'
import { missingEnvVariableUrl } from 'convex-helpers/server'
import { zInternalAction } from '@packages/zodvex'
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
  { headers: z.any(), payload: z.string() },
  async (ctx, args) => {
    const wh = new Webhook(webhookSecret)
    const payload = wh.verify(args.payload, args.headers) as WebhookEvent
    return payload
  }
)
