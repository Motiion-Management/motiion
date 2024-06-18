import {
  ExperienceType,
  preloadMyExperiencesByType
} from '@/lib/server/experiences'
import { NewExperienceForm } from './new-experience-form'
import { me } from '@/lib/server/users'
import { EditableTimeline } from './editable-timeline'

export default async function ResumeExperienceEditPage({
  params: { experience: experienceType }
}: {
  params: { experience: ExperienceType }
}) {
  const user = await me()
  const { preloadedExperiences } = await preloadMyExperiencesByType({
    type: experienceType
  })

  return (
    <div className="px-2">
      <EditableTimeline preloadedExperiences={preloadedExperiences} />

      <NewExperienceForm type={experienceType} userId={user._id} />
    </div>
  )
}
