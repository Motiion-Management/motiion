import 'server-only'

import { fetchQuery } from 'convex/nextjs'
import { getAuthToken } from '@/lib/server/utils'
import { api } from '@packages/backend/convex/_generated/api'
import { redirect } from 'next/navigation'

export async function myHeadshots() {
  const token = await getAuthToken()
  const headshots = await fetchQuery(api.resumes.getMyHeadshots, {}, { token })

  if (!headshots) {
    redirect('/sign-in')
  }
  return headshots
}

export async function myUploads() {
  const token = await getAuthToken()
  const uploads = await fetchQuery(
    api.resumes.getMyResumeUploads,
    {},
    { token }
  )

  if (!uploads) {
    redirect('/sign-in')
  }
  return uploads
}

export async function myAttributes() {
  const token = await getAuthToken()
  const resume = await fetchQuery(api.resumes.getMyAttributes, {}, { token })

  if (!resume) {
    redirect('/sign-in')
  }
  return resume
}
