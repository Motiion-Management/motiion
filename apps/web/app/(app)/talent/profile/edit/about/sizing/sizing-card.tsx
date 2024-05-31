'use client'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SizingCard({
  children,
  title,
  className
}: {
  children: React.ReactNode
  title: string
  className?: string
}) {
  return (
    <Card className={cn('h-fit', className)}>
      <CardContent className="divide-border flex flex-col divide-y py-4">
        <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
          <AccordionItem value="item-1" className="w-full border-none">
            <AccordionTrigger
              EndIcon={ChevronDown}
              className="w-full justify-between p-0"
            >
              {title}
            </AccordionTrigger>
            <AccordionContent className="p-0">{children}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
