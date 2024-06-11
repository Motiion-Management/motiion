import 'server-only'

import { fetchQuery, preloadQuery } from 'convex/nextjs'
import { getAuthToken } from '@/lib/server/utils'
import { api } from '@packages/backend/convex/_generated/api'
import { redirect } from 'next/navigation'
import { Id } from '@packages/backend/convex/_generated/dataModel'

// export async function myHeadshots() {
//   const token = await getAuthToken()
//   const headshots = await fetchQuery(
//     api.users.headshots.getMyHeadshots,
//     {},
//     { token }
//   )
//
//   if (!headshots) {
//     redirect('/sign-in')
//   }
//   return headshots
// }

// export async function myUploads() {
//   const token = await getAuthToken()
//   const resume = await fetchQuery(api.users.resume.getMyResume, {}, { token })
//
//   return resume?.uploads || []
// }

// export async function myAttributes() {
//   const token = await getAuthToken()
//   const resume = await fetchQuery(api.resumes.getMyAttributes, {}, { token })
//
//   if (!resume) {
//     redirect('/sign-in')
//   }
//   return resume
// }

export async function preloadMySizes() {
  const token = await getAuthToken()
  const resume = await preloadQuery(api.resumes.getMySizes, {}, { token })

  if (!resume) {
    redirect('/sign-in')
  }
  return resume
}

export async function getMyResume() {
  const token = await getAuthToken()
  const resume = await fetchQuery(api.resumes.getMyResume, {}, { token })

  if (!resume) {
    redirect('/sign-in')
  }
  return resume
}

export async function preloadMyResume() {
  const token = await getAuthToken()
  const resume = await preloadQuery(api.resumes.getMyResume, {}, { token })

  if (!resume) {
    redirect('/sign-in')
  }
  return resume
}

export async function getPublicResume(userId: Id<'users'>) {
  const resume = await fetchQuery(api.resumes.getPublicResume, { userId })

  if (!resume) {
    redirect('/404')
  }
  return resume
}
