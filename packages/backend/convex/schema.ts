import { defineSchema } from 'convex/server'
import { Validator } from 'convex/values'
// validators imported from this file are used in place of v.* from convex/values
import * as validators from 'convex-helpers/validators'
import { Table } from 'convex-helpers/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nullish = <T extends Validator<any, false, any>>(validator: T) =>
  v.optional(v.nullable(validator))

const v = {
  ...validators,
  nullish
}

export const fileUploadObject = v.object({
  storageId: v.id('_storage'),
  title: v.optional(v.string),
  uploadDate: v.string
})

export const fileUploadObjectArray = v.array(fileUploadObject)

const visibility = v.literals('Public', 'Private')
const hairColor = v.nullish(
  v.literals('black', 'brown', 'blonde', 'Dyed - See current headshot')
)
const eyeColor = v.nullish(
  v.literals('blue', 'brown', 'green', 'hazel', 'gray', 'amber', 'red', 'black')
)
const ethnicity = v.literals(
  'American Indian / Alaska Native',
  'Asian',
  'Black / African American',
  'Hispanic / Latino',
  'Native Hawaiian / Pacific Islander',
  'White / Caucasian'
)

const sizing = v.object(
  v.partial({
    chest: v.number,
    waist: v.number,
    neck: v.number,
    shoes: v.number,
    jacket: v.string
  })
)

const gender = v.optional(v.literals('Male', 'Female', 'Non-Binary'))
const proficiency = v.literals('Novice', 'Proficient', 'Expert')

const location = v.object({
  name: v.nullish(v.string),
  country: v.string,
  state: v.string,
  city: v.string,
  zipCode: v.nullish(v.string),
  address: v.nullish(v.string)
})

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

export const Resumes = Table('resume', {
  userId: v.id('users'),
  televisionAndFilm: v.optional(v.array(v.id('experiences'))),
  musicVideos: v.optional(v.array(v.id('experiences'))),
  livePerformances: v.optional(v.array(v.id('experiences'))),
  commercials: v.optional(v.array(v.id('experiences'))),
  training: v.optional(v.array(v.id('training'))),
  skills: v.optional(v.array(v.id('skills'))),
  height: v.optional(v.number),
  weight: v.optional(v.number),
  hairColor,
  eyeColor,
  ethnicity: v.optional(ethnicity),
  sizing: v.optional(sizing),
  representation: v.optional(v.id('agencies')),
  yearsOfExperience: v.optional(v.number),
  headshots: v.optional(fileUploadObjectArray),
  resumeUploads: v.optional(fileUploadObjectArray),
  links: v.optional(
    v.object({
      reel: v.optional(v.string),
      socials: v.array(v.object({ platform: v.string, link: v.string })),
      portfolio: v.array(v.object({ title: v.string, link: v.string }))
    })
  )
})

export const Experiences = Table('experiences', {
  userId: v.id('users'),
  visibility: visibility,
  title: v.string,
  role: v.array(v.string),
  credits: v.array(v.string),
  year: v.number,
  link: v.nullish(v.string),
  media: v.union(v.id('_storage'), v.string)
})

export const Training = Table('training', {
  userId: v.id('users'),
  visibility: visibility,
  title: v.string,
  role: v.array(v.string),
  references: v.array(v.string),
  startYear: v.nullish(v.number),
  endYear: v.nullish(v.number),
  link: v.nullish(v.string)
})

export const Skills = Table('skills', {
  userId: v.id('users'),
  name: v.string,
  proficiency
})

export const Agents = Table('agents', {
  userId: v.id('users'),
  agency: v.id('agencies')
})
// Agency organizations, must be created by an agent user
export const Agencies = Table('agencies', {
  name: v.string,
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
    users: Users.table.index('tokenId', ['tokenId']),

    // resume data
    resumes: Resumes.table.index('userId', ['userId']),
    experiences: Experiences.table.index('userId', ['userId']),
    training: Training.table.index('userId', ['userId']),
    skills: Skills.table.index('userId', ['userId']),

    // agency
    agents: Agents.table.index('userId', ['userId']),
    agencies: Agencies.table
  },
  {
    schemaValidation: false
  }
)
