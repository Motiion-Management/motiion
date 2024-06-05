import { Button } from '@/components/ui/button'
import { useRef, useState } from 'react'
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

export interface EditDrawerProps<T extends FieldValues> {
  children: React.ReactNode
  label?: string
  value?: React.ReactNode
  actionSlot?: React.ReactNode
  onSubmit: (formData: T) => Promise<void>
}
export function EditDrawer<T extends FieldValues>({
  children,
  label,
  value,
  actionSlot: actionSlot,
  onSubmit
}: EditDrawerProps<T>) {
  const drawerCloseRef = useRef<HTMLButtonElement>(null)
  const [loading, setLoading] = useState(false)

  const form = useFormContext<T>()

  async function handleSave(data: T) {
    setLoading(true)
    await onSubmit(data)
    drawerCloseRef.current?.click()
    setLoading(false)
  }

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
      <DrawerContent>
        <div className="divide-border flex flex-col divide-y">
          <DrawerHeader className="flex justify-between gap-2 px-6 text-start">
            <h4 className="text-h4">{label}</h4>
            <DrawerClose ref={drawerCloseRef}>
              <X size={24} strokeWidth={1.5} className="" />
            </DrawerClose>
          </DrawerHeader>
          <div className="py-6">{children}</div>
          <DrawerFooter>
            <Button
              loading={loading}
              onClick={form.handleSubmit(handleSave)}
              disabled={!form.formState.isValid}
            >
              Save
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
