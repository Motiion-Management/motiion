import { defineSchema } from 'convex/server'
import { Validator } from 'convex/values'
// validators imported from this file are used in place of v.* from convex/values
import * as validators from 'convex-helpers/validators'
import { Table } from 'convex-helpers/server'

import { zodToConvex } from 'convex-helpers/server/zod'
import { Resumes } from './validators/resume'
import { location, zVisibility } from './validators/base'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nullish = <T extends Validator<any, false, any>>(validator: T) =>
  v.optional(v.nullable(validator))

const v = {
  ...validators,
  nullish
}

const gender = v.optional(v.literals('Male', 'Female', 'Non-Binary'))

// App Users, used for all logged in users
export const Users = Table('users', {
  tokenId: v.string,
  type: v.literal('member'),
  isAdmin: v.boolean,
  email: v.string,
  firstName: v.nullish(v.string),
  lastName: v.nullish(v.string),
  displayName: v.nullish(v.string),
  phone: v.nullish(v.string),
  dateOfBirth: v.nullish(v.string),
  gender,
  location: v.optional(location),
  // user activity
  eventsAttended: v.nullish(v.array(v.id('events'))),
  pointsEarned: v.number,
  onboardingStep: v.number,
  profileTip: v.boolean,
  representationTip: v.boolean
})
export const Experiences = Table('experiences', {
  userId: v.id('users'),
  visibility: zodToConvex(zVisibility),
  title: v.string,
  role: v.array(v.string),
  credits: v.array(v.string),
  year: v.number,
  link: v.nullish(v.string),
  media: v.union(v.id('_storage'), v.string)
})

export const Training = Table('training', {
  userId: v.id('users'),
  visibility: zodToConvex(zVisibility),
  title: v.string,
  role: v.array(v.string),
  references: v.array(v.string),
  startYear: v.nullish(v.number),
  endYear: v.nullish(v.number),
  link: v.nullish(v.string)
})

export const Agents = Table('agents', {
  userId: v.id('users'),
  agency: v.id('agencies')
})
// Agency organizations, must be created by an agent user
export const Agencies = Table('agencies', {
  name: v.string,
  listed: v.boolean,
  shortName: v.optional(v.string),
  email: v.optional(v.string),
  logo: v.optional(v.id('_storage')),
  location: v.optional(location),
  ownerId: v.optional(v.id('users')),
  managerList: v.optional(v.array(v.id('users'))),
  phone: v.optional(v.string),
  websiteUrl: v.optional(v.string)
})

// Home Screen Configuration Tables
export const FeaturedContent = Table('featuredContent', {
  title: v.string,
  description: v.string,
  media: v.id('_storage'),
  contract: v.nullish(v.id('_storage')),
  link: v.string
})
export const FeaturedChoreographers = Table('featuredChoreographers', {
  choreographers: v.array(
    v.object({
      userId: v.id('users'),
      featuredMedia: v.id('_storage')
    })
  )
})

export const PointValues = Table('pointValues', {
  title: v.string,
  points: v.number
})

export const EventTypes = Table('eventTypes', {
  name: v.string
})

export const Events = Table('events', {
  attendanceCode: v.number,
  pointValue: v.id('pointValues'),
  sponsorAgencyId: v.nullish(v.id('agencies')),
  organizers: v.array(v.id('users')),
  title: v.string,
  type: v.id('eventTypes'),
  description: v.nullish(v.string),
  websiteUrl: v.nullish(v.string),
  location: location,
  startDate: v.string,
  endDate: v.string,
  active: v.boolean,
  timeline: v.array(
    v.object({
      title: v.string,
      location: location,
      description: v.nullish(v.string),
      startDate: v.string,
      endDate: v.string,
      date: v.string
    })
  )
})

export default defineSchema(
  {
    // global
    featuredContent: FeaturedContent.table,
    featuredChoreographers: FeaturedChoreographers.table,
    pointValues: PointValues.table,
    eventTypes: EventTypes.table,
    events: Events.table.index('attendanceCode', ['attendanceCode']),

    // user
    users: Users.table
      .index('tokenId', ['tokenId'])
      .searchIndex('search_users', {
        searchField: 'firstName',
        filterFields: ['firstName', 'lastName', 'representationTip']
      }),

    // resume data
    resumes: Resumes.table.index('userId', ['userId']),
    experiences: Experiences.table.index('userId', ['userId']),
    training: Training.table.index('userId', ['userId']),

    // agency
    agents: Agents.table.index('userId', ['userId']),
    agencies: Agencies.table.searchIndex('search_name', { searchField: 'name' })
  },
  {
    schemaValidation: false
  }
)