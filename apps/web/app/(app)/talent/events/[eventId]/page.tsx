import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { fetchQuery } from 'convex/nextjs'
import { redirect } from 'next/navigation'
import { format, toDate } from 'date-fns'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Link, Compass } from 'lucide-react'

const ReadOnlyField = ({ value, label }: { value: string; label: string }) => {
  return (
    <div className="grid">
      <span className="text-label-xs text-secondary uppercase">{label}</span>
      <Input className="bg-background" disabled value={value} />
    </div>
  )
}

function toTime(timestamp: string) {
  return format(toDate(timestamp), 'h:mm a')
}

export default async function EventPage({
  params: { eventId }
}: {
  params: { eventId: Id<'events'> }
}) {
  const event = await fetchQuery(api.events.read, { id: eventId })
  if (!event) redirect('/talent/home')
  const type = await fetchQuery(api.eventTypes.read, { id: event.type })
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-h3">{event.title}</h1>
        <span className="text-label-xs">{type?.name}</span>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-h4">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            <ReadOnlyField value={toTime(event.startDate)} label="starts" />
            {event.endDate && event.startDate !== event.endDate && <ReadOnlyField value={toTime(event.endDate)} label="ends" />}
          </div>
          {event.location && (
            <div className="grid grid-cols-[1fr_min-content] gap-2 items-center">
              <ReadOnlyField
                value={event.location.name || event.location.address || ''}
                label="location"
              />
              <Button asChild variant='outline' size='sm' className='mt-2' >
                <a
                  className="text-body-sm flex items-center gap-2 hover:underline"
                  target="_blank"
                  href={`//maps.apple.com/?q=${event.location.address},${event.location.city},${event.location.state},${event.location.zipCode}`}
                >
                  Go <Compass />
                </a>
              </Button>
            </div>
          )}
          {event.description && (
            <div className="grid gap-2">
              <Separator className="mb-2" />
              <span className="text-label-xs text-secondary uppercase">
                description
              </span>
              <div className="text-body-sm">{event.description}</div>
            </div>
          )}
          {event.websiteUrl && (
            <div className="grid gap-2">
              <Separator className="mb-2" />
              <span className="text-label-xs text-secondary uppercase">
                website
              </span>
              <Button asChild variant='secondary' >
                <a
                  className="text-body-sm flex items-center gap-2 hover:underline"
                  target="_blank"
                  href={event.websiteUrl}
                >
                  See More <Link size={12} />
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
