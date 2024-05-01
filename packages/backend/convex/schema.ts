import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const visibility = v.union(v.literal('Public'), v.literal('Private'))

export default defineSchema({
  // Home Screen Configuration Tables
  featuredContent: defineTable({
    title: v.string(),
    description: v.string(),
    media: v.id('_storage'),
    contract: v.optional(v.id('_storage')),
    link: v.string()
  }),
  featuredChoreographers: defineTable({
    choreographers: v.array(
      v.object({
        userId: v.id('users'),
        featuredMedia: v.id('_storage')
      })
    )
  }),

  // App Users, used for all logged in users
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    isAdmin: v.boolean()
  }).index('by_userId', ['userId']),

  // Used to normalize location data, used in many tables.
  locations: defineTable({
    userId: v.optional(v.id('users')),
    name: v.optional(v.string()),
    country: v.string(),
    state: v.string(),
    city: v.string(),
    zipCode: v.optional(v.string()),
    address: v.optional(v.string())
  }),

  agencies: defineTable({
    ownerId: v.id('users'),
    managerList: v.array(v.id('users')),
    name: v.string(),
    location: v.id('locations'),
    contact: v.number(),
    email: v.string(),
    websiteUrl: v.optional(v.string()),
    logo: v.id('_storage')
  }).index('by_ownerId', ['ownerId']),

  pointValues: defineTable({
    title: v.string(),
    points: v.number()
  }),

  experiences: defineTable({
    userId: v.id('users'),
    visibility: visibility,
    title: v.string(),
    role: v.array(v.string()),
    credits: v.array(v.string()),
    year: v.number(),
    link: v.optional(v.string()),
    media: v.union(v.id('_storage'), v.string()) // upload an image or provide a video link
  }).index('by_userId', ['userId']),

  training: defineTable({
    userId: v.id('users'),
    visibility: visibility,
    title: v.string(),
    role: v.array(v.string()),
    references: v.array(v.string()),
    startYear: v.optional(v.number()),
    endYear: v.optional(v.number()),
    link: v.optional(v.string())
  }).index('by_userId', ['userId']),

  skills: defineTable({
    userId: v.id('users'),
    name: v.string(),
    proficiency: v.union(
      v.literal('Novice'),
      v.literal('Proficient'),
      v.literal('Expert')
    )
  }),

  members: defineTable({
    // Member Meta
    userId: v.id('users'),
    firstName: v.string(),
    lastName: v.string(),
    displayName: v.optional(v.string()),
    dateOfBirth: v.string(),
    gender: v.string(),
    contact: v.number(),
    location: v.id('locations'),
    // Member App Activity
    eventsAttended: v.array(v.id('events')),
    pointsEarned: v.number(),
    // Member Physical details
    height: v.optional(v.number()),
    hairColor: v.union(
      v.literal('black'),
      v.literal('brown'),
      v.literal('blonde'),
      v.literal('Dyed - See current headshot'),
      v.null()
    ),
    eyeColor: v.union(
      v.literal('blue'),
      v.literal('brown'),
      v.literal('green'),
      v.literal('hazel'),
      v.literal('gray'),
      v.literal('amber'),
      v.literal('red'),
      v.literal('black'),
      v.null()
    ),
    sizing: v.object({
      chest: v.optional(v.number()),
      waist: v.optional(v.number()),
      neck: v.optional(v.number()),
      shoes: v.optional(v.number()),
      jacket: v.optional(v.string())
    }),
    // Member Professional details
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
    experience: v.optional(
      v.object({
        televisionAndFilm: v.array(v.id('experiences')),
        musicVideos: v.array(v.id('experiences')),
        livePerformances: v.array(v.id('experiences')),
        commercials: v.array(v.id('experiences')),
        training: v.array(v.id('training')),
        skills: v.array(v.id('skills'))
      })
    ),
    links: v.object({
      reel: v.optional(v.string()),
      socials: v.array(v.object({ platform: v.string(), link: v.string() })),
      portfolio: v.array(v.object({ title: v.string(), link: v.string() }))
    })
  }).index('by_userId', ['userId']),

  eventTypes: defineTable({
    name: v.string()
  }),

  events: defineTable({
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
})
