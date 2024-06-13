import { useEffect, useRef } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger
} from '@/components/ui/drawer'
import { Pencil, X } from 'lucide-react'
import { FieldValues, useFormContext } from 'react-hook-form'
import { FormButton } from './form-button'

export interface EditDrawerProps {
  children: React.ReactNode
  label?: string
  value?: React.ReactNode
  actionSlot?: React.ReactNode
}
export function EditDrawer<T extends FieldValues>({
  children,
  label,
  value,
  actionSlot
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
      <div className="relative">
        <DrawerTrigger className="flex w-full items-center justify-between gap-2 py-3">
          <div className="flex flex-col items-start gap-2">
            {label && (
              <div className="text-label-xs text-ring uppercase">{label}</div>
            )}
            <div className="text-body-xs capitalize">{value || 'None'}</div>
          </div>
          {!actionSlot && (
            <Pencil size={16.5} className="fill-black stroke-white" />
          )}
        </DrawerTrigger>
        <div className="absolute right-0 top-0 grid h-full place-items-center">
          {actionSlot}
        </div>
      </div>
      <DrawerContent forceMount>
        <div className="divide-border flex flex-col divide-y">
          <DrawerHeader className="flex justify-between gap-2 p-6 text-start">
            <h4 className="text-h4">{label}</h4>
            <DrawerClose ref={drawerCloseRef}>
              <X size={24} strokeWidth={1.5} className="" />
            </DrawerClose>
          </DrawerHeader>
          <div className="py-6">{children}</div>
          <DrawerFooter>
            <FormButton>Save</FormButton>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
