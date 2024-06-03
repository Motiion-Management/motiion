import { Card, CardContent } from '@/components/ui/card'
import { preloadMyAttributes } from '@/lib/server/resumes'
import { RepresentationForm } from './form'

export default async function ProfileEditRepresentationPage() {
  const preloadedAttributes = await preloadMyAttributes()

  return (
    <Card className="h-fit">
      <CardContent className="divide-border flex flex-col divide-y py-2">
        <RepresentationForm preloadedValues={preloadedAttributes} />
      </CardContent>
    </Card>
  )
}
