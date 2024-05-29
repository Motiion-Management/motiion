import { formatHeight } from '@/lib/utils'
import { differenceInYears, toDate, endOfToday } from 'date-fns'
import Image from 'next/image'
const calculateAge = (dateOfBirth?: string | null) => {
  if (!dateOfBirth) {
    return
  }
  const dob = toDate(dateOfBirth)
  return differenceInYears(endOfToday(), dob)
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col text-center">
      <div className="text-h4 capitalize">{value}</div>
      <p className="text-label-xs uppercase tracking-[0.6px]">{label}</p>
    </div>
  )
}

export function UserStats({ userStats }: { userStats: any }) {
  const {
    dateOfBirth,
    yearsOfExperience,
    gender,
    height,
    hairColor,
    eyeColor,
    chest,
    waist,
    shoes,
    jacket,
    representation
  } = userStats || {}

  return (
    <div className="text-primary-foreground/80 grid grid-cols-1 gap-4">
      <div className=" grid grid-cols-5 grid-rows-2 gap-5 border-y border-y-gray-500 p-5">
        <Stat label="Age" value={calculateAge(dateOfBirth)} />
        <Stat label="Yrs Exp" value={yearsOfExperience} />
        <Stat label="Gender" value={gender?.[0]} />
        <Stat label="Height" value={formatHeight(height)} />
        <Stat label="Hair" value={hairColor?.slice(0, 2)} />
        <Stat label="Eyes" value={eyeColor?.slice(0, 3)} />
        <Stat label="Chest" value={chest} />
        <Stat label="Waist" value={waist} />
        <Stat label="Shoes" value={shoes} />
        <Stat label="Jacket" value={jacket} />
      </div>
      <div className="text-primary-foreground flex items-center justify-between gap-5 px-5">
        Representation
        {representation?.logo && (
          <Image
            width={50}
            height={30}
            src={representation.logo}
            alt={representation.shortName || representation.name}
          />
        )}
      </div>
    </div>
  )
}
