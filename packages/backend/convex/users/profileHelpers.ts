import { Id } from '../_generated/dataModel'
import { DatabaseReader, DatabaseWriter } from '../_generated/server'

// Helper to get the active profile for read/write operations
export async function getActiveProfileTarget(
  db: DatabaseReader | DatabaseWriter,
  user: any
): Promise<{
  targetId: Id<'users'> | Id<'dancers'> | Id<'choreographers'>
  profile: any | null
}> {
  // Default to user if no profile
  let targetId = user._id
  let profile = null

  if (
    user.activeProfileType &&
    (user.activeDancerId || user.activeChoreographerId)
  ) {
    if (user.activeProfileType === 'dancer' && user.activeDancerId) {
      profile = await db.get(user.activeDancerId)
      if (profile) {
        targetId = user.activeDancerId
      }
    } else if (
      user.activeProfileType === 'choreographer' &&
      user.activeChoreographerId
    ) {
      profile = await db.get(user.activeChoreographerId)
      if (profile) {
        targetId = user.activeChoreographerId
      }
    }
  }

  return { targetId, profile }
}
