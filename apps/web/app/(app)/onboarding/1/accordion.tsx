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
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Accordion type="multiple" className="col-span-2 -mt-4 w-full">
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger
          StartIcon={PlusCircle}
          startIconClassName="stroke-card fill-accent h-6 w-6"
        >
          {label}
        </AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
