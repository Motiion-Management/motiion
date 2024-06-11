import { zLocation, zVisibility } from './base'
import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'

export const events = {
  attendanceCode: z.number(),
  pointValue: z.number(),
  sponsorAgencyId: zid('agencies').optional(),
  organizers: z.array(zid('users')).optional(),
  title: z.string(),
  type: zid('eventTypes'),
  description: z.string().optional(),
  websiteUrl: z.string().optional(),
  location: zLocation,
  startDate: z.string(),
  endDate: z.string(),
  active: z.boolean(),
  timeline: z
    .array(
      z.object({
        title: z.string(),
        location: zLocation,
        description: z.string().optional(),
        startDate: z.string(),
        endDate: z.string(),
        date: z.string(),
        visible: zVisibility
      })
    )
    .optional()
}

export const zEvents = z.object(events)
export const Events = Table('events', zodToConvexFields(events))
