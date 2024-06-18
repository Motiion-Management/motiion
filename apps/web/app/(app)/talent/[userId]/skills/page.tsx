import { ExperienceType } from '@/lib/server/experiences'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { ProfileHeaderBody } from './profile-header-body'
import { fetchPublicUser } from '@/lib/server/users'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ExperienceField = ({
  label,
  value
}: {
  label: string
  value?: string | string[]
}) =>
  value && (
    <>
      <div className="flex flex-col items-start gap-2 pt-4">
        <div className="text-label-xs text-ring uppercase">{label}</div>
        <div className="text-body-xs capitalize">
          {typeof value === 'string' ? value : value.join(', ')}
        </div>
      </div>
    </>
  )

export default async function ResumeExperienceEditPage({
  params: { userId }
}: {
  params: { userId: Id<'users'>; experience: ExperienceType }
}) {
  const user = await fetchPublicUser(userId)

  return (
    <div className="flex flex-col gap-4 px-2">
      <ProfileHeaderBody user={user} />
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle className="text-h5">Skills by level</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 divide-y">
          <ExperienceField label="Expert" value={user.resume?.skills?.expert} />
          <ExperienceField
            label="Proficent"
            value={user.resume?.skills?.proficient}
          />
          <ExperienceField label="Novice" value={user.resume?.skills?.novice} />
        </CardContent>
      </Card>
    </div>
  )
}
