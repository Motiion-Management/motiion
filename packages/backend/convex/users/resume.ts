import { query } from '../_generated/server'
import { authMutation } from '../util'
import { v } from 'convex/values'
import { zodToConvex } from 'convex-helpers/server/zod'
import { resume } from '../validators/users'
import { zFileUploadObjectArray } from '../validators/base'

export const getResume = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id)
    if (!user?.resume) return

    const { resume } = user

    const uploads = await Promise.all(
      (resume.uploads || []).map(async (resumeUpload) => ({
        url: await ctx.storage.getUrl(resumeUpload.storageId),
        ...resumeUpload
      }))
    )

    const publicExperiences = await Promise.all(
      (resume.experiences || []).map(async (experienceId) => {
        const experience = await ctx.db.get(experienceId)
        if (!experience || !experience.public) return
        return experience
      })
    )

    return {
      ...publicExperiences,
      uploads
    }
  }
})

export const saveResumeUploadIds = authMutation({
  args: {
    resumeUploads: zodToConvex(zFileUploadObjectArray)
  },
  handler: async (ctx, args) => {
    if (!ctx.user) return

    const resumeUploads = [
      ...args.resumeUploads,
      ...(ctx.user.resume?.uploads || [])
    ]

    ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        uploads: resumeUploads
      }
    })
  }
})

export const removeResumeUpload = authMutation({
  args: {
    resumeUploadId: v.id('_storage')
  },
  handler: async (ctx, args) => {
    if (!ctx.user) {
      return
    }

    await ctx.storage.delete(args.resumeUploadId)

    const uploads = (ctx.user.resume?.uploads || []).filter(
      (h) => h.storageId !== args.resumeUploadId
    )

    await ctx.db.patch(ctx.user._id, {
      resume: { ...ctx.user.resume, uploads }
    })
  }
})

export const updateMyResume = authMutation({
  args: {
    experiences: zodToConvex(resume.experiences),
    skills: zodToConvex(resume.skills)
  },
  handler: async (ctx, args) => {
    if (!ctx.user) return

    ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        experiences: args.experiences,
        skills: args.skills
      }
    })
  }
})
