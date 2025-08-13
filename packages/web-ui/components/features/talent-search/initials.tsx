import { FC } from 'react'

export const Initials: FC<{ firstName?: string; lastName?: string }> = ({
  firstName,
  lastName
}) => {
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`

  return (
    <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-white">
      {initials}
    </div>
  )
}
