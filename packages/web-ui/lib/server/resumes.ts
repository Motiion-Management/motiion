import 'server-only'

import { fetchQuery, preloadQuery } from 'convex/nextjs'
import { getAuthToken } from '@/lib/server/utils'
import { api } from '@packages/backend/convex/_generated/api'
import { redirect } from 'next/navigation'
import { Id } from '@packages/backend/convex/_generated/dataModel'

export async function getMyResume() {
  const token = await getAuthToken()
  const resume = await fetchQuery(api.users.resume.getMyResume, {}, { token })

  if (!resume) {
    redirect('/sign-in')
  }
  return resume
}

export async function getMyExperienceCounts() {
  const token = await getAuthToken()
  const experienceCounts = await fetchQuery(
    api.users.resume.getMyExperienceCounts,
    {},
    { token }
  )

  return experienceCounts
}

export async function fetchUserPublicExperienceCounts(id: Id<'users'>) {
  const experienceCounts = await fetchQuery(
    api.users.resume.getUserPublicExperienceCounts,
    { id }
  )

  return experienceCounts
}

export async function preloadMyResume() {
  const token = await getAuthToken()
  const resume = await preloadQuery(api.users.resume.getMyResume, {}, { token })

  if (!resume) {
    redirect('/sign-in')
  }
  return resume
}

export async function getPublicResume(userId: Id<'users'>) {
  const resume = await fetchQuery(api.users.resume.getResume, { userId })

  if (!resume) {
    redirect('/404')
  }
  return resume
}
