import { zLocation, zVisibility } from './base'
import { zid } from 'convex-helpers/server/zodV4'
import { zodTable } from '@packages/zodvex'
import { z } from 'zod'
import { Doc } from '../_generated/dataModel'

export const events = {
  attendanceCode: z.number(),
  pointValue: z.number(),
  sponsorAgencyId: zid('agencies').optional(),
  organizers: z.array(zid('users')).optional(),
  title: z.string(),
  type: zid('eventTypes'),
  description: z.string().optional(),
  websiteUrl: z.string().optional(),
  location: zLocation.optional(),
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
export const Events = zodTable('events', zEvents)

export const generateAttendanceCode = () =>
  ((1 + Math.random() * 9) | 0) +
  [...Array(5)].map(() => (Math.random() * 10) | 0).join(``)

export const welcomeEvent = {
  active: true,
  attendanceCode: 123456,
  description: '',
  endDate: 'Fri Aug 16 2024',
  organizers: undefined,
  pointValue: 50,
  sponsorAgencyId: '',
  startDate: 'Mon Jun 08 2024',
  timeline: undefined,
  title: 'Welcome to Motiion!',
  type: 'kd75ym0r3vhef385dwd5fjx1ms6vc7nk',
  websiteUrl: 'https://motiion.com'
}

export type EventDoc = Doc<'events'>
