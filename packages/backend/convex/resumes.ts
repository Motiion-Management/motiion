import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'
import { getOneFrom } from 'convex-helpers/server/relationships'
import { fileUploadObject, fileUploadObjectArray } from './schema'
import { crud } from 'convex-helpers/server'
import { Resumes } from './schema'
import { ConvexError, v } from 'convex/values'

export const { read } = crud(Resumes, query, mutation)

export const { create, update, destroy } = crud(
  Resumes,
  authQuery,
  authMutation
)

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

export const removeHeadshot = authMutation({
  args: {
    headshotId: v.id('_storage')
  },
  handler: async (ctx, args) => {
    const resume = await getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)

    if (!resume) {
      return
    }

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

    return (resume?.resumeUploads || []).map(({ storageId, ...meta }) => ({
      url: ctx.storage.getUrl(storageId),
      ...meta
    }))
  }
})

export const saveHeadshotIds = authMutation({
  args: {
    headshots: fileUploadObjectArray // other args...
  },
  handler: async (ctx, args) => {
    const resume = await getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)

    const headshots = [...args.headshots]

    if (!resume) {
      ctx.db.insert('resumes', {
        userId: ctx.user._id,
        headshots
      })
    } else {
      headshots.push(...(resume.headshots || []))

      ctx.db.patch(resume._id, {
        headshots
      })
    }
  }
})

export const saveResumeUploadId = authMutation({
  args: {
    resumeUpload: fileUploadObject
  },
  handler: async (ctx, args) => {
    const resume = await getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)

    const resumeUploads = [args.resumeUpload]

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
