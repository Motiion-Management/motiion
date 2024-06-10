import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'

export const agents = {
  userId: zid('users'),
  agency: zid('agencies')
}

export const zAgents = z.object(agents)

export const Agents = Table('agents', zodToConvexFields(agents))
