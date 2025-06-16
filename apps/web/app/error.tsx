'use client'

import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ChevronDown, Recycle } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="grid h-dvh w-full grid-cols-1 place-items-center">
      <Card>
        <CardHeader>
          <h4>Something went wrong.</h4>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Accordion type="single">
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger EndIcon={ChevronDown} className="p-0">
                See Details
              </AccordionTrigger>
              <AccordionContent className="p-0">
                {error.message}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Button className="flex gap-2" variant="outline" onClick={reset}>
            {`Try reloading`}
            <Recycle />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
