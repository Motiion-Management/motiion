import { Timeline, TimelineEvent } from '@/components/ui/timeline'
import {
  fetchMyExperiencesByType,
  ExperienceType
} from '@/lib/server/experiences'
import { FABAddDrawer } from '@/components/features/fab-add-drawer'
import { ExperienceForm } from './experience-form'
import { EXPERIENCE_TITLE_MAP } from '@packages/backend/convex/validators/experiences'
import { InputField } from '@/components/ui/form-fields/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default async function ResumeExperienceEditPage({
  params: { experience: experienceType }
}: {
  params: { experience: ExperienceType }
}) {
  const experiences = await fetchMyExperiencesByType({ type: experienceType })
  return (
    <div className="">
      <ExperienceForm type={experienceType}>
        <Timeline>
          {experiences.map((experience) => (
            <TimelineEvent
              key={experience._id}
              title={experience.title}
              startYear={experience.startYear}
            >
              experience.description
            </TimelineEvent>
          ))}
        </Timeline>
        <FABAddDrawer label={`Add ${EXPERIENCE_TITLE_MAP[experienceType]}`}>
          <div className="grid grid-cols-1 gap-4 py-6 [&>div:not(.separator)]:mx-8 [&>div:not(.separator)]:mb-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="private-toggle" className="text-body">
                Make Private
              </Label>
              <Switch name="private" id="private-toggle" />
            </div>
            <Separator />
            <InputField name="title" label="Title" required tabIndex={1} />
            <InputField
              name="startYear"
              type="number"
              label="Year"
              required
              tabIndex={2}
            />
            <Separator />
            <InputField name="role[0]" label="Role" required tabIndex={3} />
            <Separator />
            <InputField name="credits[0]" label="Credits" tabIndex={4} />
            <Separator />
            <InputField
              name="link"
              label="Link"
              type="url"
              placeholder="https://www.youtube.com/12ab23d"
              tabIndex={5}
            />
          </div>
        </FABAddDrawer>
      </ExperienceForm>
    </div>
  )
}
