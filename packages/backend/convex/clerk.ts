'use node'

import type { WebhookEvent } from '@clerk/clerk-sdk-node'
import { internalAction } from './_generated/server'
import { Webhook } from 'svix'
import { v } from 'convex/values'
import { missingEnvVariableUrl } from 'convex-helpers/server'

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

export const fulfill = internalAction({
  args: { headers: v.any(), payload: v.string() },
  handler: async (ctx, args) => {
    const wh = new Webhook(webhookSecret)
    const payload = wh.verify(args.payload, args.headers) as WebhookEvent
    return payload
  }
})
