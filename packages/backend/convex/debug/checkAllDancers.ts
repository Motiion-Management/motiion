import { internalQuery } from '../_generated/server'
import { v } from 'convex/values'

/**
 * Debug query to check all dancer profiles and users
 */
export const checkAllDancers = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const dancers = await ctx.db.query('dancers').collect()
    const users = await ctx.db.query('users').collect()

    return {
      totalDancers: dancers.length,
      totalUsers: users.length,
      dancers: dancers.map((d) => ({
        _id: d._id,
        userId: d.userId,
        displayName: d.displayName,
        isPrimary: d.isPrimary,
        createdAt: d.createdAt
      })),
      usersWithActiveDancer: users
        .filter((u) => u.activeDancerId)
        .map((u) => ({
          _id: u._id,
          email: u.email,
          firstName: u.firstName,
          activeDancerId: u.activeDancerId
        })),
      testerUser: users.find((u) => u.firstName === 'Tester')
    }
  }
})
