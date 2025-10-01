import { action } from '../_generated/server'
import { zAction } from '@packages/zodvex'
import { internal } from '../_generated/api'

// One-off action to trigger internal date migration.
// Note: use `any` to avoid TS circular inference of generated types
export const runMigrateDates: any = zAction(action, {}, async (ctx) => {
  // Cast to any to avoid type-cycle inference issues from generated API
  return await ctx.runMutation((internal as any).migrations.migrateDates, {})
})
