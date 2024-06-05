import { preloadMe } from '@/lib/server/users'
import { DisplayRepForm } from './display-rep-form'
import { RepresentationForm } from './form'
import { RepAlert } from './rep-alert'
import { preloadMyResume } from '@/lib/server/resumes'
import { preloadedQueryResult } from 'convex/nextjs'

export default async function ProfileEditRepresentationPage() {
  const preloadedUser = await preloadMe()
  const preloadedResume = await preloadMyResume()
  const user = preloadedQueryResult(preloadedUser)
  const resume = preloadedQueryResult(preloadedResume)
  return (
    <div className="flex flex-col gap-4">
      <DisplayRepForm preloadedResume={preloadedResume} />
      {!resume?.displayRepresentation ? (
        !user?.representationTip && (
          <RepAlert
            preloadedUser={preloadedUser}
            preloadedResume={preloadedResume}
          />
        )
      ) : (
        <RepresentationForm preloadedResume={preloadedResume} />
      )}
    </div>
  )
}
