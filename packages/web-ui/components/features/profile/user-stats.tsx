import { formatHeight } from '@/lib/utils'
import { differenceInYears, toDate, endOfToday } from 'date-fns'
import { RepLogo } from './quick-card/representation'
import { UserDoc } from '@packages/backend/convex/schemas/users'
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
      <div className="text-h4 capitalize">{value || '-'}</div>
      <p className="text-label-xs uppercase tracking-[0.6px]">{label}</p>
    </div>
  )
}

export function UserStats({ user }: { user: UserDoc }) {
  return (
    <div className="text-primary-foreground/80 grid grid-cols-1 gap-4">
      <div className="grid grid-cols-5 grid-rows-2 gap-5 border-y border-y-gray-500 p-5">
        <Stat label="Age" value={calculateAge(user?.dateOfBirth)} />
        <Stat label="Yrs Exp" value={user.attributes?.yearsOfExperience} />
        <Stat label="Gender" value={user?.attributes?.gender?.[0]} />
        <Stat label="Height" value={formatHeight(user.attributes?.height)} />
        <Stat label="Hair" value={user.attributes?.hairColor?.slice(0, 2)} />
        <Stat label="Eyes" value={user.attributes?.eyeColor?.slice(0, 3)} />
        <Stat label="Waist" value={user.sizing?.general?.waist} />
        <Stat
          label="Shoes"
          value={user.sizing?.male?.shoes || user.sizing?.female?.shoes}
        />
        <Stat label="Jacket" value={user.sizing?.male?.coatLength?.[0]} />
      </div>
      <div className="text-primary-foreground flex items-center justify-between gap-5 px-5">
        Representation
        {user?.representation?.agencyId ? (
          <RepLogo id={user.representation.agencyId} />
        ) : (
          <div className="text-h5">None</div>
        )}
      </div>
    </div>
  )
}
