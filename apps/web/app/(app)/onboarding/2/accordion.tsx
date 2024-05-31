'use client'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger
} from '@/components/ui/accordion'
import { PlusCircle } from 'lucide-react'

export function AccordionPlus({
  label,
  className,
  children
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Accordion type="multiple" className={className}>
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger
          rotate45
          StartIcon={PlusCircle}
          startIconClassName="stroke-card fill-accent h-6 w-6"
          className="p-0"
        >
          {label}
        </AccordionTrigger>
        <AccordionContent className="p-0">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
