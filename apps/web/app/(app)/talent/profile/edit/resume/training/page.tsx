import { preloadMyExperiencesByType } from '@/lib/server/experiences'
import { NewTrainingForm } from './new-training-form'
import { me } from '@/lib/server/users'
import { EditableTimeline } from './editable-timeline'

export default async function ResumeExperienceEditPage({}) {
  const user = await me()
  const experienceType = 'training'
  const { preloadedExperiences } = await preloadMyExperiencesByType({
    type: experienceType
  })

  return (
    <div className="px-2">
      <EditableTimeline preloadedExperiences={preloadedExperiences} />

      <NewTrainingForm type={experienceType} userId={user._id} />
    </div>
  )
}
