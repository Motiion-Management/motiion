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
      <div className="capitalize">{value}</div>
      <p className="text-xs uppercase tracking-[0.6px]">{label}</p>
    </div>
  )
}

export function UserStats({
  userStats: {
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
  }
}: {
  userStats: any
}) {
  console.log({
    height,
    hairColor,
    eyeColor,
    waist,
    shoes,
    jacket,
    representation
  })
  return (
    <>
      <div className="text-primary-foreground mt-28 grid grid-cols-5 grid-rows-2 gap-5 border-y border-y-gray-500 p-5">
        <Stat label="Age" value={calculateAge(dateOfBirth)} />
        <Stat label="Yrs Exp" value={yearsOfExperience} />
        <Stat label="Gender" value={gender?.[0]} />
        <Stat label="Height" value={height} />
        <Stat label="Hair" value={hairColor?.slice(0, 2)} />
        <Stat label="Eyes" value={eyeColor?.slice(0, 3)} />
        <Stat label="Chest" value={chest} />
        <Stat label="Waist" value={waist} />
        <Stat label="Shoes" value={shoes} />
        <Stat label="Jacket" value={jacket} />
      </div>
      <div className="text-primary-foreground flex justify-between gap-5 px-5 pt-6">
        Representation
        <Image
          width={50}
          height={30}
          src={representation.logo}
          alt={representation.shortName || representation.name}
        />
      </div>
    </>
  )
}
