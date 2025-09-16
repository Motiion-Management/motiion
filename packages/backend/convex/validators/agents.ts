import { zid } from 'convex-helpers/server/zodV4'
import { zodTable } from '@packages/zodvex'
import { z } from 'zod'

export const agents = {
  userId: zid('users'),
  agency: zid('agencies')
}

export const zAgents = z.object(agents)

export const Agents = zodTable('agents', zAgents)
