import { Card, CardContent } from '@/components/ui/card'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { myAttributes } from '@/lib/server/resumes'
import { Pencil } from 'lucide-react'

function inchesToFeetAndInches(inches: number) {
  // Convert inches to feet.
  const feet = Math.floor(inches / 12)

  // Get the remaining inches.
  const remainingInches = inches % 12

  // Return the result as a string.
  return `${feet} ft. ${remainingInches} in.`
}

export default async function ProfileEditAttributesPage() {
  const attributes = await myAttributes()

  return (
    <Card>
      <CardContent>
        <EditDrawer
          label="Height"
          value={inchesToFeetAndInches(attributes.height || 0)}
        >
          HEIGHT
        </EditDrawer>
        <EditDrawer label="Weight" value="150 lbs">
          WIDTH
        </EditDrawer>
      </CardContent>
    </Card>
  )
}

function EditDrawer({
  children,
  label,
  value
}: {
  children: React.ReactNode
  label: string
  value: string
}) {
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
