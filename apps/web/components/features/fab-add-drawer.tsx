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
import { X } from 'lucide-react'
import { FieldValues, useFormContext } from 'react-hook-form'
import { FAB } from '../ui/floating-action-button'

export interface FABAddDrawerProps<T extends FieldValues> {
  children: React.ReactNode
  label?: string
  value?: React.ReactNode
  onSubmit: (formData: T) => Promise<void>
}
export function FABAddDrawer<T extends FieldValues>({
  children,
  label,
  onSubmit
}: FABAddDrawerProps<T>) {
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
      <DrawerTrigger asChild>
        <FAB />
      </DrawerTrigger>
      <DrawerContent>
        <div className="divide-border flex flex-col divide-y">
          <DrawerHeader className="flex justify-between gap-2 p-6 text-start">
            <h4 className="text-h4">{label}</h4>
            <DrawerClose ref={drawerCloseRef}>
              <X size={24} strokeWidth={1.5} />
            </DrawerClose>
          </DrawerHeader>
          <div className="py-6">{children}</div>
          <DrawerFooter>
            <Button
              loading={loading}
              onClick={form.handleSubmit(handleSave)}
              disabled={!form.formState.isValid}
            >
              Add
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
