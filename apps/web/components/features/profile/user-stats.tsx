import { formatHeight } from '@/lib/utils'
import { ResumeDoc } from '@packages/backend/convex/resumes'
import { UserDoc } from '@packages/backend/convex/users'
import { differenceInYears, toDate, endOfToday } from 'date-fns'
import { RepLogo } from './quick-card/representation'
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

export function UserStats({
  user,
  resume
}: {
  user: UserDoc
  resume: ResumeDoc
}) {
  return (
    <div className="text-primary-foreground/80 grid grid-cols-1 gap-4">
      <div className=" grid grid-cols-5 grid-rows-2 gap-5 border-y border-y-gray-500 p-5">
        <Stat label="Age" value={calculateAge(user?.dateOfBirth)} />
        <Stat label="Yrs Exp" value={resume?.yearsOfExperience} />
        <Stat label="Gender" value={user?.gender?.[0]} />
        <Stat label="Height" value={formatHeight(resume?.height)} />
        <Stat label="Hair" value={resume?.hairColor?.slice(0, 2)} />
        <Stat label="Eyes" value={resume?.eyeColor?.slice(0, 3)} />
        <Stat label="Waist" value={resume?.sizing?.general?.waist} />
        <Stat
          label="Shoes"
          value={resume?.sizing?.male?.shoes || resume?.sizing?.female?.shoes}
        />
        <Stat label="Jacket" value={resume?.sizing?.male?.coatLength} />
      </div>
      <div className="text-primary-foreground flex items-center justify-between gap-5 px-5">
        Representation
        {resume?.representation ? (
          <RepLogo id={resume?.representation} />
        ) : (
          <div className="text-h5">None</div>
        )}
      </div>
    </div>
  )
}
