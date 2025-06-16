import { FC } from 'react'
import { cn } from '@/lib/utils'

export const Stat: FC<{
  label: string
  value: React.ReactNode
  className?: string
}> = ({ label, value, className }) => {
  return (
    <div className={cn('flex flex-col items-start gap-2 py-3', className)}>
      <div className="text-label-xs text-ring uppercase">{label}</div>
      <p className="text-body-xs capitalize">
        {value || <span className="invisible">_</span>}
      </p>
    </div>
  )
}

export const StatGroup: FC<{
  title?: string
  children: React.ReactNode
  cols?: number
}> = ({ children, title, cols = 1 }) => {
  return (
    <>
      {title ? (
        <h6 className="text-h6 mb-2 mt-4 self-end uppercase">{title}</h6>
      ) : (
        <div className="-mb-1 w-full bg-inherit" />
      )}
      <div
        className={`grid grid-cols-${cols} ${cols === 1 ? 'divide-y' : '*:border-t'}`}
      >
        {children}
      </div>
    </>
  )
}
