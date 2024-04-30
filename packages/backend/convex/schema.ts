import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const experience = v.object({
  userId: v.id('users'),
  agencyId: v.optional(v.id('agencies')),
  visibility: v.string(),
  title: v.string(),
  role: v.array(v.string()),
  credits: v.array(v.string()),
  year: v.number(),
  link: v.optional(v.string()),
  media: v.union(v.id('_storage'), v.string()) // upload an image or provide a video link
})

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    isAdmin: v.boolean()
  }).index('by_userId', ['userId']),

  locations: defineTable({
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

  members: defineTable({
    userId: v.id('users'),
    firstName: v.string(),
    lastName: v.string(),
    displayName: v.optional(v.string()),
    dateOfBirth: v.string(),
    gender: v.string(),
    contact: v.number(),
    location: v.id('locations'),
    headshots: v.array(
      v.object({ imageId: v.id('_storage'), title: v.string() })
    ),
    resume: v.object({
      uploads: v.array(
        v.object({
          resumeId: v.id('_storage'),
          title: v.string(),
          uploadDate: v.string()
        })
      ),
      about: v.object({
        height: v.optional(v.number()),
        hairColor: v.optional(v.string()),
        eyeColor: v.optional(v.string()),
        chest: v.optional(v.number()),
        waist: v.optional(v.number()),
        shoeSize: v.optional(v.number()),
        jacketSize: v.optional(v.string()),
        yearsOfExperience: v.optional(v.number())
      }),
      experience: v.object({
        skills: v.array(experience),
        televisionAndFilm: v.array(experience),
        musicVideos: v.array(experience),
        livePerformances: v.array(experience),
        commercials: v.array(experience),
        training: v.array(experience)
      }),
      links: v.object({
        reel: v.optional(v.string()),
        socials: v.array(v.object({ platform: v.string(), link: v.string() })),
        portfolio: v.array(v.object({ title: v.string(), link: v.string() }))
      })
    })
  }).index('by_userId', ['userId'])
})
