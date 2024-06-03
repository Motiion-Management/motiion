import { query, mutation, MutationCtx } from './_generated/server'
import { authMutation, authQuery } from './util'
import { getOneFrom } from 'convex-helpers/server/relationships'
import { crud } from 'convex-helpers/server'
import { ConvexError, v } from 'convex/values'
import { Doc, Id } from './_generated/dataModel'
import { pick } from 'convex-helpers'
import { Resumes, zFileUploadObjectArray } from './validators/resume'
import { zodToConvex } from 'convex-helpers/server/zod'

export const { read } = crud(Resumes, query, mutation)

export type ResumeDoc = Doc<'resumes'>

export const { create, update, destroy } = crud(
  Resumes,
  authQuery,
  authMutation
)

export const getMyResume = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) {
      return null
    }
    return getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)
  }
})

export const getPublicResume = query({
  args: {
    userId: v.id('users')
  },
  handler: async (ctx, args) => {
    return getOneFrom(ctx.db, 'resumes', 'userId', args.userId)
  }
})

export const getMyAttributes = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) {
      return null
    }
    const resume = await getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)

    if (!resume) {
      return null
    }

    const { ethnicity, height, eyeColor, hairColor } = resume

    return {
      ethnicity,
      height,
      eyeColor,
      hairColor
    }
  }
})

export const updateMyAttributes = authMutation({
  args: pick(Resumes.withoutSystemFields, [
    'ethnicity',
    'height',
    'eyeColor',
    'hairColor'
  ]),
  handler: async (ctx, args) => {
    const resume = await getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)

    if (!resume) {
      ctx.db.insert('resumes', {
        userId: ctx.user._id,
        ...args
      })
    } else {
      ctx.db.patch(resume._id, args)
    }
  }
})

export const getMySizes = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) {
      return null
    }
    const resume = await getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)

    if (!resume) {
      return null
    }

    const { sizing } = resume

    return {
      sizing,
      gender: ctx.user.gender
    }
  }
})

export const updateMySizes = authMutation({
  args: pick(Resumes.withoutSystemFields, ['sizing']),
  handler: async (ctx, args) => {
    const resume = await getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)

    if (!resume) {
      ctx.db.insert('resumes', {
        userId: ctx.user._id,
        ...args
      })
    } else {
      ctx.db.patch(resume._id, args)
    }
  }
})

export const getMyHeadshots = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) {
      return []
    }
    const resume = await getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)

    return Promise.all(
      (resume?.headshots || []).map(async (headshot) => ({
        url: await ctx.storage.getUrl(headshot.storageId),
        ...headshot
      }))
    )
  }
})

export const getMyStats = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) {
      return
    }
    const resume = await getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)

    let representation = null
    let repLogo = null
    if (resume?.representation) {
      representation = await ctx.db.get(resume.representation)
      if (representation?.logo) {
        repLogo = await ctx.storage.getUrl(representation?.logo)
      }
    }

    return {
      ...resume,
      ...resume?.sizing,
      gender: ctx.user.gender,
      dateOfBirth: ctx.user.dateOfBirth,
      representation: {
        ...representation,
        logo: repLogo
      }
    }
  }
})

async function ensureOnlyFive(
  ctx: MutationCtx,
  files: { storageId: Id<'_storage'>; title?: string; uploadDate: string }[]
) {
  let current
  while (files.length > 5) {
    current = files.pop()
    console.log('deleting', current)
    await ctx.storage.delete(current!.storageId)
  }
  return files
}
export const saveHeadshotIds = authMutation({
  args: {
    headshots: zodToConvex(zFileUploadObjectArray) // other args...
  },
  handler: async (ctx, args) => {
    const resume = await getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)

    const headshots = [...args.headshots]

    if (resume?.headshots?.length === 5) {
      throw new ConvexError(
        'You already have 5 headshots. Please remove one before adding another.'
      )
    }

    if (!resume) {
      ctx.db.insert('resumes', {
        userId: ctx.user._id,
        headshots: await ensureOnlyFive(ctx, headshots)
      })
    } else {
      headshots.unshift(...(resume.headshots || []))

      ctx.db.patch(resume._id, {
        headshots: await ensureOnlyFive(ctx, headshots)
      })
    }
  }
})

export const removeHeadshot = authMutation({
  args: {
    headshotId: v.id('_storage')
  },
  handler: async (ctx, args) => {
    const resume = await getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)

    if (!resume) {
      return
    }

    await ctx.storage.delete(args.headshotId)

    const headshots = (resume.headshots || []).filter(
      (h) => h.storageId !== args.headshotId
    )

    await ctx.db.patch(resume._id, { headshots })
  }
})

export const getMyResumeUploads = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) {
      return []
    }
    const resume = await getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)

    return Promise.all(
      (resume?.resumeUploads || []).map(async (resumeUpload) => ({
        url: await ctx.storage.getUrl(resumeUpload.storageId),
        ...resumeUpload
      }))
    )
  }
})

export const saveResumeUploadIds = authMutation({
  args: {
    resumeUploads: zodToConvex(zFileUploadObjectArray)
  },
  handler: async (ctx, args) => {
    const resume = await getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)

    const resumeUploads = [...args.resumeUploads]
    if (!resume) {
      ctx.db.insert('resumes', {
        userId: ctx.user._id,
        resumeUploads
      })
    } else {
      resumeUploads.push(...(resume.resumeUploads || []))

      ctx.db.patch(resume._id, {
        resumeUploads
      })
    }
  }
})

export const removeResumeUpload = authMutation({
  args: {
    resumeUploadId: v.id('_storage')
  },
  handler: async (ctx, args) => {
    const resume = await getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)

    if (!resume) {
      return
    }

    await ctx.storage.delete(args.resumeUploadId)

    const resumeUploads = (resume.resumeUploads || []).filter(
      (h) => h.storageId !== args.resumeUploadId
    )

    await ctx.db.patch(resume._id, { resumeUploads })
  }
})
