import { Card, CardContent } from '@/components/ui/card'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Pencil } from 'lucide-react'

export default function ProfileEditAttributesPage() {
  return (
    <Card>
      <CardContent>
        <EditDrawer label="Height" value="5' 10">
          HEIGHT
        </EditDrawer>
        <EditDrawer label="Weight" value="150 lbs">
          WIDTH
        </EditDrawer>
      </CardContent>
    </Card>
  )
}

function EditDrawer({ children, label, value }) {
  return (
    <Drawer>
      <DrawerTrigger className="flex w-full items-center justify-between gap-2">
        <div className="flex flex-col items-start">
          <div className="text-label-xs text-secondary uppercase">{label}</div>
          <div className="text-body-xs">{value}</div>
        </div>
        <Pencil size={16.5} />
      </DrawerTrigger>
      <DrawerContent>{children}</DrawerContent>
    </Drawer>
  )
}
