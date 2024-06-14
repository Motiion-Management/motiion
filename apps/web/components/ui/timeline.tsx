import { FC } from 'react'
import './timeline.css'
import { AccordionCard } from '@/components/ui/accordion-card'

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
      <AccordionCard className="timeline-end w-full" title={title}>
        {children}
      </AccordionCard>
      <hr />
    </li>
  )
}

export type TimelineProps = {
  children: ReturnType<typeof TimelineEvent>[]
}

export const Timeline: FC<TimelineProps> = ({ children }) => {
  return <ul className="timeline timeline-vertical">{children}</ul>
}
