import { preloadMySizes } from '@/lib/server/resumes'
import { GeneralSizingForm } from './general-sizing-form'
import { SizingCard } from './sizing-card'
import { MaleSizingForm } from './male-sizing-form'
import { FemaleSizingForm } from './female-sizing-form'
import { me } from '@/lib/server/users'

export default async function ProfileEditAttributesPage() {
  const preloadedSizes = await preloadMySizes()
  const user = await me()

  return (
    <div className="flex flex-col gap-4">
      <SizingCard title="General Sizing">
        <GeneralSizingForm preloadedValues={preloadedSizes} />
      </SizingCard>
      {user.gender !== 'Female' && (
        <SizingCard title="Male Sizing">
          <MaleSizingForm preloadedValues={preloadedSizes} />
        </SizingCard>
      )}
      {user.gender !== 'Male' && (
        <SizingCard title="Female Sizing">
          <FemaleSizingForm preloadedValues={preloadedSizes} />
        </SizingCard>
      )}
    </div>
  )
}
