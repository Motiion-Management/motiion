'use client'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger
} from '@/components/ui/accordion'
import { InputField } from '@/components/ui/form-fields/input'
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
        <AccordionContent>
          {children}
          <InputField
            name="displayName"
            placeholder="What should we call you?"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
