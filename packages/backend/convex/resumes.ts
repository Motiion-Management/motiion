import { query, mutation, MutationCtx } from './_generated/server'
import { authMutation, authQuery } from './util'
import { getOneFrom } from 'convex-helpers/server/relationships'
import { fileUploadObjectArray } from './schema'
import { crud } from 'convex-helpers/server'
import { Resumes, Agencies } from './schema'
import { ConvexError, v } from 'convex/values'
import { Id } from './_generated/dataModel'

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

export const getMyStats = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) {
      return []
    }
    const resume = await getOneFrom(ctx.db, 'resumes', 'userId', ctx.user._id)
    let agency
    if (resume?.representation) {
      //       @param db — DatabaseReader, passed in from the function ctx

      // @param table — The table to fetch the target document from.

      // @param index — The index on that table to look up the specified value by.

      // @param value — The value to look up the document by, often an ID.

      // @param field
      // The field on that table that should match the specified value. Optional if the index is named after the field.
      agency = await getOneFrom(ctx.db, 'agencies', 'agencyId', resume.representation)
    }
    return (
      {
        eyeColor: resume?.eyeColor,
        hairColor: resume?.hairColor,
        height: resume?.height,
        yearsOfExperience: resume?.yearsOfExperience,
        jacket: resume?.sizing?.jacket,
        shoes: resume?.sizing?.shoes,
        waist: resume?.sizing?.waist,
        chest: resume?.sizing?.chest,
        representation: resume?.representation
      } || {}
    )
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
    headshots: fileUploadObjectArray // other args...
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
    resumeUploads: fileUploadObjectArray
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
