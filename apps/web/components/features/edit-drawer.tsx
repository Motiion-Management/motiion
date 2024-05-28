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

export function EditDrawer({
  children,
  label,
  value,
  onSubmit
}: {
  children: React.ReactNode
  label: string
  value?: React.ReactNode
  loading?: boolean
  onSubmit: () => Promise<void>
}) {
  const drawerCloseRef = useRef<HTMLButtonElement>(null)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    await onSubmit()
    drawerCloseRef.current?.click()
    setLoading(false)
  }
  return (
    <Drawer>
      <DrawerTrigger className="flex w-full items-center justify-between gap-2 py-3">
        <div className="flex flex-col items-start gap-2">
          <div className="text-label-xs text-ring uppercase">{label}</div>
          <div className="text-body-xs">{value}</div>
        </div>
        <Pencil size={16.5} className="fill-black stroke-white" />
      </DrawerTrigger>
      <DrawerContent>
        <div className="divide-border flex flex-col divide-y">
          <DrawerHeader className="flex justify-between gap-2 px-6 text-start">
            <h4 className="text-h4">{label}</h4>
            <DrawerClose ref={drawerCloseRef}>
              <X size={24} strokeWidth={1.5} className="" />
            </DrawerClose>
          </DrawerHeader>
          <div className="p-6">{children}</div>
          <DrawerFooter>
            <Button loading={loading} onClick={handleSave}>
              Save
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
