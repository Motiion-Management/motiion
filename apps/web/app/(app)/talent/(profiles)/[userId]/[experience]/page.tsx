import {
  ExperienceType,
  fetchUserPublicExperiencesByType
} from '@/lib/server/experiences'
import { Timeline, ResumeTimelineEvent } from '@/components/ui/timeline'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { VideoOrLink } from './video-or-link'
import { ProfileHeaderBody } from './profile-header-body'
import { fetchPublicUser } from '@/lib/server/users'
import { Separator } from '@/components/ui/separator'

const ExperienceField = ({
  label,
  value
}: {
  label: string
  value?: string | string[]
  border?: boolean
}) =>
  value && (
    <>
      <div className="flex flex-col items-start gap-2 pt-4">
        <div className="text-label-xs text-ring uppercase">{label}</div>
        <div className="text-body-xs capitalize">{value}</div>
      </div>
    </>
  )

export default async function ResumeExperienceEditPage(
  props: {
    params: Promise<{ userId: Id<'users'>; experience: ExperienceType }>
  }
) {
  const params = await props.params;

  const {
    userId,
    experience: experienceType
  } = params;

  const user = await fetchPublicUser(userId)
  const experiences = await fetchUserPublicExperiencesByType({
    userId,
    type: experienceType
  })

  return (
    <div className="flex flex-col gap-4 px-2">
      <ProfileHeaderBody user={user} />
      <Separator />
      <Timeline className="flex-1 ">
        {experiences.map((experience) => (
          <ResumeTimelineEvent
            key={experience._id}
            title={experience.title}
            startYear={experience.startYear}
          >
            <div className="my-2 grid gap-4 divide-y">
              <VideoOrLink href={experience.link} />
              <ExperienceField
                label="References"
                value={experience.references}
                border
              />
              <ExperienceField label="Role" value={experience.role} />
              <ExperienceField
                label="Credits"
                value={experience.credits}
                border
              />
            </div>
          </ResumeTimelineEvent>
        ))}
      </Timeline>
    </div>
  )
}
