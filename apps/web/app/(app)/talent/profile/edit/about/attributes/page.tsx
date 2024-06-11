import { Card, CardContent } from '@/components/ui/card'
import { AttributesForm } from './attributes-form'
import { preloadMe } from '@/lib/server/users'

export default async function ProfileEditAttributesPage() {
  const [preloadedUser] = await preloadMe()

  return (
    <Card className="h-fit">
      <CardContent className="divide-border flex flex-col divide-y py-2">
        <AttributesForm preloadedUser={preloadedUser} />
      </CardContent>
    </Card>
  )
}
