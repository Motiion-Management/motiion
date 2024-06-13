import { FC } from 'react'
import './timeline.css'
import { AccordionCard } from '@/components/ui/accordion-card'

export type TimelinePoint = {
  startYear: number | string
  endYear?: number | string
  title: string
  content: React.ReactNode
}

export type TimelineProps = {
  points: TimelinePoint[]
}

export const Timeline: FC<TimelineProps> = ({ points }) => {
  return (
    <ul className="timeline timeline-vertical">
      {points.map((point, index) => (
        <li key={index}>
          <hr />
          <div className="timeline-start">
            {point.startYear}
            {point.endYear && `- ${point.endYear}`}
          </div>
          <div className="timeline-middle">
            <div className="timeline-mark" />
          </div>
          <div className="timeline-end">{point.content}</div>
          <AccordionCard className="timeline-end w-full" title={point.title}>
            {point.content}
          </AccordionCard>
          <hr />
        </li>
      ))}
    </ul>
  )
}
