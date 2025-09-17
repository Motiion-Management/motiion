import { FC } from 'react'
import { AccordionCard } from '@/components/ui/accordion-card'
import { Stat, StatGroup } from '@/components/features/stats'
import { UserDoc } from '@packages/backend/convex/schemas/users'

export const SizingCard: FC<{
  user: UserDoc
}> = ({ user }) => {
  const { sizing, attributes } = user
  const gender = attributes?.gender
  return (
    <AccordionCard title="Sizing" withParent>
      <StatGroup title="General" cols={2}>
        <Stat label="Waist" value={sizing?.general?.waist} />
        <Stat label="Inseam" value={sizing?.general?.inseam} />
        <Stat label="Glove" value={sizing?.general?.glove} />
        <Stat label="Hat" value={sizing?.general?.hat} />
      </StatGroup>
      {gender !== 'Female' && (
        <StatGroup title="Male" cols={2}>
          <Stat label="Neck" value={sizing?.male?.neck} />
          <Stat label="Chest" value={sizing?.male?.chest} />
          <Stat label="Sleeve" value={sizing?.male?.sleeve} />
          <Stat label="Coast Length" value={sizing?.male?.coatLength} />
          <Stat label="Shirt" value={sizing?.male?.shirt} />
          <Stat label="Shoes" value={sizing?.male?.shoes} />
        </StatGroup>
      )}
      {gender !== 'Male' && (
        <StatGroup title="Female" cols={2}>
          <Stat label="Hips" value={sizing?.female?.hips} />
          <Stat label="Bust" value={sizing?.female?.bust} />
          <Stat label="Underbust" value={sizing?.female?.underbust} />
          <Stat label="Cup" value={sizing?.female?.cup} />
          <Stat label="Coat Length" value={sizing?.female?.coatLength} />
          <Stat label="Shirt" value={sizing?.female?.shirt} />
          <Stat label="Dress" value={sizing?.female?.dress} />
          <Stat label="Pants" value={sizing?.female?.pants} />
          <Stat label="Shoes" value={sizing?.female?.shoes} />
        </StatGroup>
      )}
    </AccordionCard>
  )
}
