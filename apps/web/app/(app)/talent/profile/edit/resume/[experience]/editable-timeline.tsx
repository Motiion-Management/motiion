'use client'
import { FC } from 'react'

import { Timeline, ResumeTimelineEvent } from '@/components/ui/timeline'
import { Separator } from '@/components/ui/separator'
import { Preloaded, usePreloadedQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { EditExperienceForm } from './edit-experience-form'

export const EditableTimeline: FC<{
  preloadedExperiences: Preloaded<
    typeof api.users.experiences.getMyExperiencesByType
  >
}> = ({ preloadedExperiences }) => {
  const experiences = usePreloadedQuery(preloadedExperiences)
  return (
    <Timeline className="flex-1">
      {experiences.map((experience) => (
        <ResumeTimelineEvent
          key={experience._id}
          title={experience.title}
          startYear={experience.startYear}
        >
          <div className="my-4 grid gap-4">
            <div className="flex flex-col items-start gap-2">
              <div className="text-label-xs text-ring uppercase">Role</div>
              <div className="text-body-xs capitalize">{experience.role}</div>
            </div>
            <Separator />
            <div className="flex flex-col items-start gap-2">
              <div className="text-label-xs text-ring uppercase">Credits</div>
              <div className="text-body-xs capitalize">
                {experience.credits}
              </div>
            </div>
            <Separator />
            <div className="flex flex-col items-start gap-2">
              <div className="text-label-xs text-ring uppercase">Link</div>
              <div className="text-body-xs capitalize">{experience.link}</div>
            </div>
            <Separator />
            <EditExperienceForm experience={experience} />
          </div>
        </ResumeTimelineEvent>
      ))}
    </Timeline>
  )
}
