import { FC } from 'react'
import './timeline.css'
import { AccordionCard } from '@/components/ui/accordion-card'
import { cn } from '@/lib/utils'
import { EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { EventDoc } from '@packages/backend/convex/validators/events'
import Link from 'next/link'
import { format, isEqual, toDate } from 'date-fns'
import Image from 'next/image'
import { api } from '@packages/backend/convex/_generated/api'
import { useQuery } from 'convex/react'

export type ResumeTimelineEventProps = {
  startYear: number | string
  endYear?: number | string
  title: string
  hidden?: boolean
  children: React.ReactNode
}

export const ResumeTimelineEvent: FC<ResumeTimelineEventProps> = ({
  startYear,
  endYear,
  title,
  hidden,
  children
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
      <AccordionCard
        startIconSlot={hidden && <EyeOff />}
        className="timeline-end w-full"
        title={title}
        defaultOpen
      >
        {children}
      </AccordionCard>
      <hr />
    </li>
  )
}
export type TimelineEventSectionProps = {
  startDate: Date
  children: React.ReactNode
}

export const TimelineEventSection: FC<TimelineEventSectionProps> = ({
  startDate,
  children
}) => {
  const startDateTime = toDate(startDate)

  return (
    <li>
      <hr />
      <div className="timeline-start">
        <div className="grid items-center">
          <span className="text-h3">{format(startDateTime, 'd')}</span>
          <span className="text-label-xs uppercase">
            {format(startDateTime, 'MMM')}
          </span>
        </div>
      </div>
      <div className="timeline-middle">
        <div className="timeline-mark" />
      </div>
      <div className="timeline-end w-full">{children}</div>
      <hr />
    </li>
  )
}
export type TimelineEventCardProps = {
  event: EventDoc
}

export const TimelineEventCard: FC<TimelineEventCardProps> = ({ event }) => {
  const startDateTime = toDate(event.startDate)
  const endDateTime = toDate(event.endDate)

  const type = useQuery(api.eventTypes.read, { id: event.type })

  return (
    <Link href={`/talent/events/${event._id}`} className="flex-1">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-h6">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end justify-between">
          <div className="grid flex-1 grid-cols-[auto_1fr] items-center gap-2">
            <Image
              src="/icons/Clock.svg"
              alt="clock icon"
              width={16}
              height={16}
            />

            <span className="text-label-xs">
              {format(startDateTime, 'h:mma') +
                (isEqual(startDateTime, endDateTime)
                  ? ''
                  : ` - ${format(endDateTime, 'h:mma')}`)}
            </span>
            {event.location && (
              <>
                <Image
                  src="/icons/Address.svg"
                  alt="address icon"
                  width={16}
                  height={16}
                />
                <a
                  href={`https://maps.google.com/?q=${event.location.address}`}
                  className="text-body-xs text-secondary underline"
                >
                  {event.location.name || event.location.address}
                </a>
              </>
            )}
          </div>
          <span className="text-label-xs text-primary/70">{type?.name}</span>
        </CardContent>
      </Card>
    </Link>
  )
}

export type TimelineProps = {
  children: ReturnType<typeof ResumeTimelineEvent>[]
  className?: string
}

export const Timeline: FC<TimelineProps> = ({ children, className }) => {
  return (
    <ul className={cn('timeline timeline-vertical', className)}>{children}</ul>
  )
}
