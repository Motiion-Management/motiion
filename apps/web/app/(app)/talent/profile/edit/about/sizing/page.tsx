import { preloadMySizes } from '@/lib/server/resumes'
import { GeneralSizingForm } from './general-sizing-form'
import { MaleSizingForm } from './male-sizing-form'
import { FemaleSizingForm } from './female-sizing-form'
import { me } from '@/lib/server/users'
import { AccordionCard } from '@/components/ui/accordion-card'

export default async function ProfileEditAttributesPage() {
  const preloadedSizes = await preloadMySizes()
  const user = await me()

  return (
    <div className="flex flex-col gap-4">
      <AccordionCard title="General Sizing">
        <GeneralSizingForm preloadedValues={preloadedSizes} />
      </AccordionCard>
      {user.gender !== 'Female' && (
        <AccordionCard title="Male Sizing">
          <MaleSizingForm preloadedValues={preloadedSizes} />
        </AccordionCard>
      )}
      {user.gender !== 'Male' && (
        <AccordionCard title="Female Sizing">
          <FemaleSizingForm preloadedValues={preloadedSizes} />
        </AccordionCard>
      )}
    </div>
  )
}
