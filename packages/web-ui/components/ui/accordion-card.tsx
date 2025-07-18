'use client'
import { Card, CardContent } from './card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from './accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import React from 'react'

export function AccordionCard({
  children,
  title,
  className,
  defaultOpen,
  withParent,
  value = title,
  startIconSlot
}: {
  children: React.ReactNode
  title: string
  className?: string
  defaultOpen?: boolean
  withParent?: boolean
  value?: string
  startIconSlot?: React.ReactNode
}) {
  function StandaloneAccordion({ children }: { children: React.ReactNode }) {
    return (
      <Accordion
        type="multiple"
        defaultValue={[defaultOpen ? value : '']}
        className="w-full"
      >
        {children}
      </Accordion>
    )
  }

  const Parent = withParent ? React.Fragment : StandaloneAccordion

  return (
    <Card className={cn('h-fit', className)}>
      <CardContent className="divide-border flex flex-col divide-y py-4">
        <Parent>
          <AccordionItem value={value} className="w-full border-none">
            <AccordionTrigger
              EndIcon={ChevronDown}
              className="w-full justify-between p-0"
            >
              <div className="text-h5 flex items-center gap-2">
                {startIconSlot}
                {title}
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">{children}</AccordionContent>
          </AccordionItem>
        </Parent>
      </CardContent>
    </Card>
  )
}
