import { zodToConvexFields } from '@packages/zodvex'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'

export const rewards = {
  title: z.string(),
  points: z.number()
}

export const zRewards = z.object(rewards)

export const Rewards = Table('rewards', zodToConvexFields(rewards))
