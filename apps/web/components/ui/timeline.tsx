import { FC } from 'react'
import './timeline.css'
import { AccordionCard } from '@/components/ui/accordion-card'
import { cn } from '@/lib/utils'

export type TimelineEventProps = {
  startYear: number | string
  endYear?: number | string
  title: string
  children: React.ReactNode
}

export const TimelineEvent: FC<TimelineEventProps> = ({
  startYear,
  endYear,
  title,
  children: children
}) => {
  return (
    <li>
      <hr />
      <div className="timeline-start">
        {startYear}
        {endYear && `- ${endYear}`}
      </div>
      <div className="timeline-middle">
        <div className="timeline-mark" />
      </div>
      <AccordionCard className="timeline-end w-full" title={title} defaultOpen>
        {children}
      </AccordionCard>
      <hr />
    </li>
  )
}

export type TimelineProps = {
  children: ReturnType<typeof TimelineEvent>[]
  className?: string
}

export const Timeline: FC<TimelineProps> = ({ children, className }) => {
  return (
    <ul className={cn('timeline timeline-vertical', className)}>{children}</ul>
  )
}
