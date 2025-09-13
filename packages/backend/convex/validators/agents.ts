import { zid } from 'convex-helpers/server/zodV4'
import { zodToConvexFields } from '@packages/zodvex'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'

export const agents = {
  userId: zid('users'),
  agency: zid('agencies')
}

export const zAgents = z.object(agents)

export const Agents = Table('agents', zodToConvexFields(agents))
