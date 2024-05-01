import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { Table } from 'convex-helpers/server' // npm i convex-helpers

const visibility = v.union(v.literal('Public'), v.literal('Private'))
const hairColor = v.union(
  v.literal('black'),
  v.literal('brown'),
  v.literal('blonde'),
  v.literal('Dyed - See current headshot'),
  v.null()
)
const eyeColor = v.union(
  v.literal('blue'),
  v.literal('brown'),
  v.literal('green'),
  v.literal('hazel'),
  v.literal('gray'),
  v.literal('amber'),
  v.literal('red'),
  v.literal('black'),
  v.null()
)
const sizing = v.object({
  chest: v.optional(v.number()),
  waist: v.optional(v.number()),
  neck: v.optional(v.number()),
  shoes: v.optional(v.number()),
  jacket: v.optional(v.string())
})
const gender = v.union(
  v.literal('Male'),
  v.literal('Female'),
  v.literal('Non-Binary')
)

// App Users, used for all logged in users
export const Users = Table('users', {
  tokenId: v.string(),
  type: v.literal('member'),
  isAdmin: v.boolean(),
  email: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  displayName: v.optional(v.string()),
  phone: v.number(),
  dateOfBirth: v.string(),
  gender,
  location: v.id('locations'),
  // user activity
  eventsAttended: v.array(v.id('events')),
  pointsEarned: v.number()
})

export const Resume = Table('resume', {
  userId: v.id('users'),
  televisionAndFilm: v.array(v.id('experiences')),
  musicVideos: v.array(v.id('experiences')),
  livePerformances: v.array(v.id('experiences')),
  commercials: v.array(v.id('experiences')),
  training: v.array(v.id('training')),
  skills: v.array(v.id('skills')),
  height: v.optional(v.number()),
  hairColor,
  eyeColor,
  sizing,
  representation: v.optional(v.id('agencies')),
  yearsOfExperience: v.optional(v.number()),
  headshots: v.array(
    v.object({ imageId: v.id('_storage'), title: v.string() })
  ),
  resumeUploads: v.array(
    v.object({
      resumeId: v.id('_storage'),
      title: v.string(),
      uploadDate: v.string()
    })
  ),
  links: v.object({
    reel: v.optional(v.string()),
    socials: v.array(v.object({ platform: v.string(), link: v.string() })),
    portfolio: v.array(v.object({ title: v.string(), link: v.string() }))
  })
})

export const Experiences = Table('experiences', {
  userId: v.id('users'),
  visibility: visibility,
  title: v.string(),
  role: v.array(v.string()),
  credits: v.array(v.string()),
  year: v.number(),
  link: v.optional(v.string()),
  media: v.union(v.id('_storage'), v.string())
})

export const Training = Table('training', {
  userId: v.id('users'),
  visibility: visibility,
  title: v.string(),
  role: v.array(v.string()),
  references: v.array(v.string()),
  startYear: v.optional(v.number()),
  endYear: v.optional(v.number()),
  link: v.optional(v.string())
})

export const Skills = Table('skills', {
  userId: v.id('users'),
  name: v.string(),
  proficiency: v.union(
    v.literal('Novice'),
    v.literal('Proficient'),
    v.literal('Expert')
  )
})

export const Agents = Table('agents', {
  userId: v.id('users'),
  agency: v.id('agencies')
})
// Agency organizations, must be created by an agent user
export const Agencies = Table('agencies', {
  ownerId: v.id('users'),
  managerList: v.array(v.id('users')),
  name: v.string(),
  location: v.id('locations'),
  contact: v.number(),
  email: v.string(),
  websiteUrl: v.optional(v.string()),
  logo: v.id('_storage')
})

// Home Screen Configuration Tables
export const FeaturedContent = Table('featuredContent', {
  title: v.string(),
  description: v.string(),
  media: v.id('_storage'),
  contract: v.optional(v.id('_storage')),
  link: v.string()
})
export const FeaturedChoreographers = Table('featuredChoreographers', {
  choreographers: v.array(
    v.object({
      userId: v.id('users'),
      featuredMedia: v.id('_storage')
    })
  )
})

export const Locations = Table('locations', {
  userId: v.optional(v.id('users')),
  name: v.optional(v.string()),
  country: v.string(),
  state: v.string(),
  city: v.string(),
  zipCode: v.optional(v.string()),
  address: v.optional(v.string())
})

export const PointValues = Table('pointValues', {
  title: v.string(),
  points: v.number()
})

export const EventTypes = Table('eventTypes', {
  name: v.string()
})

export const Events = Table('events', {
  attendanceCode: v.number(),
  pointValue: v.id('pointValues'),
  sponsorAgencyId: v.optional(v.id('agencies')),
  organizers: v.array(v.id('users')),
  title: v.string(),
  type: v.id('eventTypes'),
  description: v.optional(v.string()),
  websiteUrl: v.optional(v.string()),
  location: v.id('locations'),
  startDate: v.string(),
  endDate: v.string(),
  active: v.boolean(),
  timeline: v.array(
    v.object({
      title: v.string(),
      location: v.optional(v.id('locations')),
      description: v.optional(v.string()),
      startDate: v.string(),
      endDate: v.string(),
      date: v.string()
    })
  )
})

export default defineSchema({
  // global
  featuredContent: FeaturedContent.table,
  featuredChoreographers: FeaturedChoreographers.table,
  locations: Locations.table.index('userId', ['userId']),
  pointValues: PointValues.table,
  eventTypes: EventTypes.table,
  events: Events.table.index('attendanceCode', ['attendanceCode']),

  // user
  users: Users.table.index('tokenId', ['tokenId']),

  // resume data
  resume: Resume.table.index('userId', ['userId']),
  experiences: Experiences.table.index('userId', ['userId']),
  training: Training.table.index('userId', ['userId']),
  skills: Skills.table.index('userId', ['userId']),

  // agency
  agents: Agents.table.index('userId', ['userId']),
  agencies: Agencies.table.index('ownerId', ['ownerId'])
})
