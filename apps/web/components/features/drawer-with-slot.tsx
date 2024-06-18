'use client'
import { useEffect, useRef } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader
} from '@/components/ui/drawer'
import { X } from 'lucide-react'
import { FieldValues, useFormContext } from 'react-hook-form'
import { FormButton } from './form-button'

export interface EditDrawerProps {
  children: React.ReactNode
  titleSlot?: React.ReactNode
  triggerSlot: React.ReactNode
}
export function DrawerWithSlots<T extends FieldValues>({
  children,
  titleSlot,
  triggerSlot
}: EditDrawerProps) {
  const drawerCloseRef = useRef<HTMLButtonElement>(null)

  const form = useFormContext<T>()

  const isSuccessful = form.formState.isSubmitted
  useEffect(() => {
    if (isSuccessful) {
      drawerCloseRef.current?.click()
    }
  }, [isSuccessful])

  return (
    <Drawer shouldScaleBackground handleOnly>
      <div className="">{triggerSlot}</div>
      <DrawerContent forceMount>
        <DrawerHeader className="flex items-center justify-between gap-2 p-6 ">
          {titleSlot}
          <DrawerClose ref={drawerCloseRef}>
            <X size={24} strokeWidth={1.5} className="" />
          </DrawerClose>
        </DrawerHeader>
        <div className="overflow-scroll">{children}</div>
        <DrawerFooter>
          <FormButton>Save</FormButton>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
