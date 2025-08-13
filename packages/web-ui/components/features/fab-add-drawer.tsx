'use client'
import { useEffect, useRef } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '../ui/drawer'
import { X } from 'lucide-react'
import { FieldValues, useFormContext } from 'react-hook-form'
import { FAB } from '../ui/floating-action-button'
import { FormButton } from './form-button'

export interface FABAddDrawerProps {
  children: React.ReactNode
  label?: string
}

export function FABAddDrawer<T extends FieldValues>({
  children,
  label
}: FABAddDrawerProps) {
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
      <DrawerTrigger asChild>
        <FAB />
      </DrawerTrigger>
      <DrawerContent forceMount>
        <DrawerHeader className="flex items-center justify-between gap-2 p-6">
          <DrawerTitle>{label}</DrawerTitle>
          <DrawerClose ref={drawerCloseRef}>
            <X size={24} strokeWidth={1.5} className="" />
          </DrawerClose>
        </DrawerHeader>
        <DrawerBody>{children}</DrawerBody>
        <DrawerFooter>
          <FormButton>Add</FormButton>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
