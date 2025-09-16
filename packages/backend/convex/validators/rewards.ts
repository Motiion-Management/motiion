import { zodTable } from '@packages/zodvex'
import { z } from 'zod'

export const rewards = {
  title: z.string(),
  points: z.number()
}

export const zRewards = z.object(rewards)

export const Rewards = zodTable('rewards', zRewards)
