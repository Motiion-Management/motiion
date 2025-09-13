import { QueryCtx, query } from '../_generated/server'
import { authMutation, authQuery } from '../util'
import { v } from 'convex/values'
import { zodToConvex } from '@packages/zodvex'
import { UserDoc, resume as resumeObj } from '../validators/users'
import type { Id } from '../_generated/dataModel'
import { zFileUploadObjectArray } from '../validators/base'
import {
  PROJECT_TITLE_MAP as EXPERIENCE_TITLE_MAP,
  PROJECT_TYPES as EXPERIENCE_TYPES
} from '../validators/projects'
import { getAll } from 'convex-helpers/server/relationships'

export async function augmentResume(
  ctx: QueryCtx,
  user: UserDoc,
  filterPublic: boolean = false
) {
  if (!user?.resume) return
  const { resume } = user

  const uploads = await Promise.all(
    (resume.uploads || []).map(async (resumeUpload: { storageId: Id<'_storage'>; title?: string; uploadDate: string }) => ({
      url: await ctx.storage.getUrl(resumeUpload.storageId),
      ...resumeUpload
    }))
  )

  const publicExperiences = await Promise.all(
    (resume.projects || []).map(async (projectId: Id<'projects'>) => {
      const project = await ctx.db.get(projectId)
      if (!project || (filterPublic && project.private)) return
      return project
    })
  )

  const experiences = EXPERIENCE_TYPES.map((type) =>
    publicExperiences.filter((e) => e?.type === type)
  )

  return {
    skills: resume.skills,
    experiences,
    uploads
  }
}
export const getResume = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) return

    return await augmentResume(ctx, user, true)
  }
})

export const getMyResume = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user) return

    return await augmentResume(ctx, ctx.user)
  }
})

export const getMyExperienceCounts = authQuery({
  args: {},
  handler: async (ctx) => {
    const exp = ctx.user?.resume?.projects
    const experiences = exp ? await getAll(ctx.db, exp) : []

    return EXPERIENCE_TYPES.map((type) => ({
      count: experiences.filter((e) => e?.type === type).length,
      title: EXPERIENCE_TITLE_MAP[type],
      slug: type
    }))
  }
})

export const getUserPublicExperienceCounts = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id)

    const exp = user?.resume?.projects
    const experiences = (exp ? await getAll(ctx.db, exp) : []).filter(
      (e) => !e?.private
    )

    return EXPERIENCE_TYPES.map((type) => ({
      count: experiences.filter((e) => e?.type === type).length,
      title: EXPERIENCE_TITLE_MAP[type],
      slug: type
    }))
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
      (h: { storageId: Id<'_storage'> }) => h.storageId !== args.resumeUploadId
    )

    await ctx.db.patch(ctx.user._id, {
      resume: { ...ctx.user.resume, uploads }
    })
  }
})

export const updateMyResume = authMutation({
  args: {
    projects: zodToConvex(resumeObj.projects),
    skills: zodToConvex(resumeObj.skills),
    genres: zodToConvex(resumeObj.genres)
  },
  handler: async (ctx, args) => {
    if (!ctx.user) return

    ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        projects: args.projects,
        skills: args.skills,
        genres: args.genres
      }
    })
  }
})
