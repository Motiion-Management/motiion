import { Card, CardContent } from '@/components/ui/card'
import { preloadMyAttributes } from '@/lib/server/resumes'
import { AttributesForm } from './attributes-form'

export default async function ProfileEditAttributesPage() {
  const preloadedAttributes = await preloadMyAttributes()

  return (
    <form className="divide-border flex flex-col divide-y py-2">
      <Card className="h-fit">
        <CardContent className="divide-border flex flex-col divide-y py-2">
          <AttributesForm preloadedValues={preloadedAttributes} />
        </CardContent>
      </Card>
    </form>
  )
}
