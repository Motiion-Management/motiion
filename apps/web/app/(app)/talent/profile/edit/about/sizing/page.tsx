import { GeneralSizingForm } from './general-sizing-form'
import { MaleSizingForm } from './male-sizing-form'
import { FemaleSizingForm } from './female-sizing-form'
import { preloadMe } from '@/lib/server/users'
import { AccordionCard } from '@/components/ui/accordion-card'

export default async function ProfileEditAttributesPage() {
  const [preloadedUser, user] = await preloadMe()

  return (
    <div className="flex flex-col gap-4">
      <AccordionCard title="General Sizing" defaultOpen>
        <GeneralSizingForm preloadedValues={preloadedUser} />
      </AccordionCard>
      {user.gender !== 'Female' && (
        <AccordionCard title="Male Sizing" defaultOpen>
          <MaleSizingForm preloadedValues={preloadedUser} />
        </AccordionCard>
      )}
      {user.gender !== 'Male' && (
        <AccordionCard title="Female Sizing" defaultOpen>
          <FemaleSizingForm preloadedValues={preloadedUser} />
        </AccordionCard>
      )}
    </div>
  )
}
